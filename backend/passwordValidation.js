const bcrypt = require('bcrypt');
const {db,dbConfig} = require('./db'); 

const saltRounds = 10;
const dictionaryWords = ['password', '123456', 'script']; 

function isPasswordValid(password) {
    const minLength = 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: "Password must be at least 10 characters long" };
    }
    if (!hasUpperCase || !hasLowerCase) {
        return { isValid: false, message: "Password must contain both upper and lower case letters" };
    }
    if (!hasNumbers) {
        return { isValid: false, message: "Password must contain at least one number" };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: "Password must contain at least one special character" };
    }

    const containsDictionaryWord = dictionaryWords.some(word => password.toLowerCase().includes(word));
    if (containsDictionaryWord) {
        return { isValid: false, message: "Password cannot contain common words (e.g., 'password', '123456')" };
    }

    return { isValid: true };
}



async function getRecentPasswords(userId) {
    const [rows] = await db.query("SELECT password1, salt1, password2, salt2, password3, salt3 FROM password_history WHERE user_id = ?", [userId]);
    
    if (rows.length > 0) {
        return rows[0];
    }
    
    return null;
}



async function addPasswordToHistory(userId, newPassword,salt) {
    
    const history = await getRecentPasswords(userId);
    const hashedPassword = await bcrypt.hash(newPassword + salt, saltRounds);
    if (history) {
        const { password1, salt1, password2, salt2, password3, salt3 } = history;

        // Compare each of the previous passwords with the new one using bcrypt.compare
        if (password1 && await bcrypt.compare(newPassword + salt1, password1)) {
            return { isValid: false, message: "New password must not match the last 3 passwords." };
        }
        if (password2 && await bcrypt.compare(newPassword + salt2, password2)) {
            return { isValid: false, message: "New password must not match the last 3 passwords." };
        }
        if (password3 && await bcrypt.compare(newPassword + salt3, password3)) {
            return { isValid: false, message: "New password must not match the last 3 passwords." };
        }
        
        // Update password history
        await db.query(`
            UPDATE password_history 
            SET password3 = password2, salt3 = salt2, 
                password2 = password1, salt2 = salt1, 
                password1 = ?, salt1 = ? 
            WHERE user_id = ?
        `, [hashedPassword, salt, userId]);

        return { isValid: true };
    } else {
   

        await db.query("INSERT INTO password_history (user_id, password1, salt1) VALUES (?, ?, ?)", [userId, hashedPassword, salt]);

        return { isValid: true };
    }
}

module.exports = { isPasswordValid, addPasswordToHistory };
