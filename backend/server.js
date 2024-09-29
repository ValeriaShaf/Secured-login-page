const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');
const bcrypt = require('bcrypt');
const { isPasswordValid , addPasswordToHistory } = require('./passwordValidation'); 
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const crypto = require('crypto');
const {db,dbConfig}=require('./db')
const nodemailer = require('nodemailer');


const app = express();
app.use(express.json());

// Allow cross-origin requests from your frontend and send credentials (i.e., cookies)
app.use(cors({
    origin: 'http://localhost:3000',  // Frontend URL
    credentials: true  // Allow cookies to be sent cross-origin
}));

// Create MySQL session store
const sessionStore = new MySQLStore(dbConfig);

// Generate a cryptographically secure secret key for signing the session cookie
const sessionSecret = crypto.randomBytes(64).toString('hex');

// Session configuration with `connect.sid` as the cookie key and a secure secret key
app.use(session({
    key: 'connect.sid',  // Session cookie name (you can change this if needed)
    secret: sessionSecret,  // Secure key for signing the session cookie
    store: sessionStore,  // Use MySQL to store session data
    resave: false,  // Prevent session from being saved again if nothing changed
    saveUninitialized: false,  // Only save a session if it is new and has data
    cookie: {
        maxAge: 1000 * 60 * 60 * 1,  // Cookie expires after 1 hour
        httpOnly: true,  // Prevent client-side JavaScript from accessing the cookie
        secure: false  // Set to true in production with HTTPS
    }
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    } else {
        return res.status(401).json("Please log in to continue.");
    }
};

// Function to send the email with the 6-digit code
async function sendVerificationEmail(email) {
    const hash = crypto.createHash('sha1').update(email + Date.now().toString()).digest('hex'); // Generate a 6-digit SHA-1 hash from the email + current timestamp
    const code = hash.slice(0, 6); // Take the first 6 characters from the hash as the code
    try {
        // Set up nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'communication.ltd.service@gmail.com', 
                pass: 'incp byev sswm sfwi',  
            }
        });

        // Compose the email
        let mailOptions = {
            from: 'communication.ltd.service@gmail.com',
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}. It is valid for 5 minutes.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Verification code sent to ${email}`);
        return {
            success: true, message: 'Code sent',
            code: code.toString(),  
            
        };
       
    } catch (error) {
        console.error('Error occurred:', error);
        return { success: false, message: 'Error sending verification email' };
    }
}

// Signup route
app.post('/signup', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(409).json({ success: false, message: "User with this email already exists" });
        }

        // Validate password using `isPasswordValid` function
        const passwordValidation = await isPasswordValid(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ success: false, message: passwordValidation.message });
        }

        // Create a new salt and hash the password
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(password + salt, 10);

        // Insert new user into the `users` table
        const [result] = await db.query(
            `
        INSERT INTO users (first_name, last_name, email, password, salt) 
        VALUES ('${firstname}', '${lastname}', '${email}', '${password}', '${salt}');
    `
            
        );
            // Insert user into the `login_attempts` table
            const userId = result.insertId;
            await db.query("INSERT INTO login_attempts (user_id, attempts) VALUES (?, 0)", [userId]);

            // Insert password into password history
            await addPasswordToHistory(userId, password, salt);
            return res.status(201).json("User successfully created");

    } catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).json("Internal Server Error");
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [data] = await db.query(`SELECT * FROM users WHERE email = '${email}';`)

        if (data.length > 0) {
            const user = data[0];
            const salt = user.salt;
            const hashedPassword = user.password;

            const [attemptData] = await db.query("SELECT * FROM login_attempts WHERE user_id = ?", [user.id]);
            const attemptsRecord = attemptData[0];

            // If there's no attempt record, create one
            if (!attemptsRecord) {
                await db.query("INSERT INTO login_attempts (user_id, attempts, locked_until) VALUES (?, 0, NULL)", [user.id]);
                attemptsRecord = { attempts: 0, locked_until: null };
            }

            // Check if the account is locked
            if (attemptsRecord.locked_until && new Date(attemptsRecord.locked_until) > new Date()) {
                return res.json({ message: "Account is locked. Wait for 6 seconds to try again." });
            }

            // Compare the provided password with the stored hashed password
            const match = await bcrypt.compare(password + salt, hashedPassword);

            if (match) {
                
                const [updatedAttemptsData] = await db.query("SELECT * FROM login_attempts WHERE user_id = ?", [user.id]);
                const updatedAttemptsRecord = updatedAttemptsData[0];

                if (updatedAttemptsRecord.attempts >= 3 && new Date(updatedAttemptsRecord.locked_until) > new Date()) {
                    
                    return res.json({ message: "Account is locked. Wait for 6 seconds to try again." });
                }

                // Successful login
                req.session.userId = user.id;
                req.session.email = user.email;
                req.session.save();

                // Reset attempts and lock
                await db.query("UPDATE login_attempts SET attempts = 0, locked_until = NULL WHERE user_id = ?", [user.id]);
                return res.json({ message: "Login successful" });
            } else {

                // Incorrect password
                await db.query("UPDATE login_attempts SET attempts = attempts + 1 WHERE user_id = ?", [user.id]);
                const [updatedAttemptsData] = await db.query("SELECT * FROM login_attempts WHERE user_id = ?", [user.id]);
                const updatedAttemptsRecord = updatedAttemptsData[0];

                if (updatedAttemptsRecord.attempts >= 3) {
                    const lockedUntil = new Date();
                    lockedUntil.setSeconds(lockedUntil.getSeconds() + 10); // Lock for 10 seconds
                    await db.query("UPDATE login_attempts SET locked_until = ? WHERE user_id = ?", [lockedUntil, user.id]);
                    return res.json({ message: "Account is locked. Wait for 6 seconds to try again." }); 
                }

                return res.json({  message: "Email or password is incorrect" });
            }
        } else {
            return res.json({  message: "Email or password is incorrect" });
        }
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json("Internal Server Error");
    }
});

// Logout route
app.post('/logout', (req, res) => {

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json("Logout failed");
        }
        res.clearCookie('connect.sid');  
        return res.json({ message: "Logout successful" });
    });
});

// Customers route (requires login)
app.get('/customers', isAuthenticated, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM customers');
        res.json(results);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).send(err);
    }
});

// Add customer route
app.post('/add-customer', isAuthenticated, async (req, res) => {
    const { id, name, address } = req.body;

    try {
        // Check if the ID already exists
        const [results] = await db.query('SELECT COUNT(*) AS count FROM customers WHERE id = ?', [id]);

        if (results[0].count > 0) {
            return res.status(400).send('ID already exists');
        }

        // Insert new customer if ID does not exist
        await db.query(`INSERT INTO customers (id, name, address) VALUES (${id}, '${name}', '${address}')`);
        return res.send('Customer added successfully');
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).send('Error adding customer');
    }
});

// Delete customer route
app.delete('/delete-customer/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Customer deleted successfully!' });
        } else {
            res.status(404).json('Customer not found.');
        }
    } catch (err) {
        console.error("Error deleting customer:", err);
        res.status(500).json("Error deleting customer.");
    }
});

// Verify password route
app.post('/verify-password', isAuthenticated, async (req, res) => {
    const { currentPassword } = req.body;
    const userId = req.session.userId;

    try {
        const [data] = await db.query("SELECT password, salt FROM users WHERE id = ?", [userId]);

        if (data.length > 0) {
            const user = data[0];
            const salt = user.salt;
            const storedPassword = user.password;

            const match = await bcrypt.compare(currentPassword + salt, storedPassword);

            if (match) {
                return res.json({ match: true });
            } else {
                return res.json({ match: false });
            }
        } else {
            return res.status(404).json("User not found");
        }
    } catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).json("Internal Server Error");
    }
});

// Change password route
app.post('/change-password', isAuthenticated, async (req, res) => {
    const { password } = req.body;
    const userId = req.session.userId;

    try {
        const passwordValidation = await isPasswordValid(password);
        if (!passwordValidation.isValid) {
            return res.json({ success: false, message: passwordValidation.message });
        }

        const salt = crypto.randomBytes(16).toString('hex');

        // Add the new password to the password history and validate history
        const historyCheck = await addPasswordToHistory(userId, password,salt);
        if (!historyCheck.isValid) {
            return res.json({ success: false, message: historyCheck.message });
        }

        const hashedPassword = await bcrypt.hash(password + salt, 10);

        // Update the user's password and salt
        await db.query("UPDATE users SET password = ?, salt = ? WHERE id = ?", [hashedPassword, salt, userId]);

        return res.json({ success: true, message:"Password changed successfully!"});
    } catch (err) {
        console.error("Error changing password:", err);
        return res.status(500).json("Internal Server Error");
    }
});

// Change password from forget password form route
app.post('/change-password-from-forget', async (req, res) => {
    const { userId, password } = req.body;

    try {
        const [result] = await db.query("SELECT user_id, expires_at FROM verificationcodes WHERE user_id = ? LIMIT 1", [userId]);

        if (result.length === 0) {
            return res.json({ success: false, message: 'Invalid or expired code' });
        }

        const now = new Date();
        if (now > new Date(result[0].expires_at)) {
            return res.json({ success: false, message: 'Session has expired' });
        }

        const passwordValidation = await isPasswordValid(password);
        if (!passwordValidation.isValid) {
            return res.json({ success: false, message: passwordValidation.message });
        }

        const salt = crypto.randomBytes(16).toString('hex');

        // Add the new password to the password history and validate history
        const historyCheck = await addPasswordToHistory(userId, password,salt);
        if (!historyCheck.isValid) {
            return res.json({ success: false, message: historyCheck.message });
        }

        const hashedPassword = await bcrypt.hash(password + salt, 10);

        await db.query("UPDATE users SET password = ?, salt = ? WHERE id = ?", [hashedPassword, salt, userId]);
        await db.query("DELETE FROM verificationcodes WHERE user_id = ?", [userId]);

        return res.json({ success: true, message: 'Password changed successfully!' });
    } catch (err) {
        console.error('Error changing password:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Verify code route (after sending email)
app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;

    try {
        // Get the user by email
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const userId = user[0].id;

        // Check the code and expiration time from the database
        const [verificationCode] = await db.query(
            'SELECT * FROM verificationcodes WHERE user_id = ? AND code = ? AND expires_at > NOW()',
            [userId, code]
        );

        if (verificationCode.length > 0) {
            // If the code is correct and not expired, allow the user to proceed
            return res.json({ success: true, message: 'Code verified' ,user_id: userId });
        } else {
            return res.json({ success: false, message: 'Incorrect or expired code' });
        }
    } catch (err) {
        console.error('Error verifying code:', err);
        return res.status(500).json({ success: false, message: 'An error occurred while verifying the code.' });
    }
});

//Send code route (via email)
app.post('/send-code', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the email exists in the users table
        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (data.length > 0) {
            const user = data[0];
            const userId = user.id;

            // Generate the verification code
            const { code } = await sendVerificationEmail(email);

            // Check if the code was successfully generated
            if (!code) {
                return res.status(500).json({ success: false, message: 'Failed to generate verification code' });
            }

            const { DateTime } = require('luxon');

            // Set expiration time 5 minutes from now, adjusted for local time zone
            const expirationTime = DateTime.local().plus({ minutes: 5 }).toFormat('yyyy-MM-dd HH:mm:ss');
            
            // Insert the code into the verificationcodes table, or update if it already exists
            await db.query(`
                INSERT INTO verificationcodes (user_id, code, expires_at) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                code = VALUES(code), expires_at = VALUES(expires_at)
            `, [userId, code, expirationTime]);

            return res.json({ success: true, message: 'Code sent successfully' });
        } else {
            return res.json({ success: false, message: 'Email not found' });
        }

    } catch (err) {
        console.error("Error sending code:", err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Function to delete expired codes from the verificationcodes table
async function deleteExpiredCodes() {
    try {
        const { DateTime } = require('luxon');
        const currentTime = DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss');
        
        await db.query("DELETE FROM verificationcodes WHERE expires_at <= ?", [currentTime]);
        console.log("Expired codes cleaned up");
    } catch (err) {
        console.error("Error cleaning up expired codes:", err);
    }
}

// Run the cleanup every minute
setInterval(deleteExpiredCodes, 10 * 1000); // 10 seconds interval


app.listen(8081, () => {
    console.log("Server listening on port 8081");
});

