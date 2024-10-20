# Computer Security Final Project – Comunication_LTD

## Introduction
This project is a demonstration of secure web application development principles combined with examples of common security vulnerabilities, including **SQL Injection** and **XSS (Cross-Site Scripting)**. The web-based information system is built for the fictional company **Comunication_LTD**, which manages internet packages and customer data through a relational database.

## Project Features
1. **Relational Database**: Implemented using MySQL.
2. **Web Application**: Developed in JavaScript, Html, CSS.
3. **User Authentication**:
   - **Register**: Users can sign up with complex passwords stored using HMAC + Salt.
   - **Login**: Secure login form with input validation.
   - **Password Reset**: Forgot password flow with email verification and SHA-1 random value generation.
   - **Change Password**: Users can change their password, following the predefined security rules.
4. **Customer Management**: Add and display customer information.

## Security Vulnerabilities Demonstration
1. **SQL Injection**: Demonstrated in the registration, login, and customer management screens.
2. **Stored XSS**: Demonstrated in the customer management screen.

## Security Solutions
1. **XSS Prevention**: Implemented input encoding to prevent script injections.
2. **SQL Injection Prevention**: Used parameterized queries to secure database interactions.

## Configuration File (Password Rules)
- Password length and complexity requirements can be customized.
- Control login attempts, prevent dictionary attacks, and set password history constraints.

## Versions
- **Vulnerable Version**: Demonstrates security flaws (SQL Injection and XSS).
- **Secured Version**: Fixes the vulnerabilities using best practices.

תקיפות לדוגמא:
לא מאובטח:

בADD CUSTOMER:
בשם:   (xss)
<script>alert("you are hacked")</script>
בכתובת:
hacked'); INSERT INTO customers (id, name, address) VALUES (3, 'hacked', 'hacked'); --

John'); DELETE FROM customers WHERE id=2; --

בSIGNUP: 
בשם משפחה: (sqli)
Doe', 'hacked2@example.com', 'Val765432!', 'salt'); INSERT INTO users (first_name, last_name, email, password) VALUES ('Hacker', 'Injected', 'hacked3@example.com', 'hacked_password'); --

Doe', 'hacked25@example.com', 'Val765432!', 'salt'); DELETE FROM users WHERE email='hacked2@example.com'; --

בLOGIN:
באימייל:
anything' OR '1'='1
Val765432!!
