import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // Modul bawaan Node.js untuk generate token acak

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const register = async (req, res) => {
    // Validasi Kompleksitas Password menggunakan Regex Joi
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().custom((value, helpers) => {
            if (!value.toLowerCase().endsWith('@gmail.com')) {
                return helpers.message("Pendaftaran hanya diizinkan menggunakan email @gmail.com");
            }
            return value;
        }).required(),
        password: Joi.string()
            .min(8)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .message("Password minimal 8 karakter dan harus terdiri dari kombinasi huruf besar, huruf kecil, dan angka!")
            .required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                otp: otpCode,
                isVerified: false
            }
        });

        await transporter.sendMail({
            from: `"EatSistent AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Kode Verifikasi EatSistent Anda",
            html: `<h3>Halo ${name}!</h3><p>Kode verifikasi (OTP) Anda adalah: <b>${otpCode}</b></p>`
        });

        res.status(201).json({ message: "Registrasi berhasil! Silakan periksa kotak masuk Gmail Anda untuk kode OTP.", email: newUser.email });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan server internal", error: err.message });
    }
};

// --- FITUR LUPA SANDI (KIRIM EMAIL RESET) ---
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email wajib diisi!" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "Email tidak ditemukan di sistem kami!" });

        // Membuat token reset unik sepanjang 6 karakter angka (atau link token kustom)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Simpan token sementara ke kolom OTP database untuk divalidasi nanti
        await prisma.user.update({
            where: { email },
            data: { otp: resetToken }
        });

        // Kirim Email Instruksi Reset Password
        await transporter.sendMail({
            from: `"EatSistent Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Atur Ulang Kata Sandi EatSistent",
            html: `<h3>Permintaan Reset Password</h3>
                   <p>Gunakan kode berikut untuk mengatur ulang kata sandi akun EatSistent Anda:</p>
                   <h2><b>${resetToken}</b></h2>
                   <p>Jika Anda tidak meminta ini, abaikan email ini.</p>`
        });

        res.status(200).json({ message: "Kode reset password berhasil dikirim ke Gmail Anda!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal memproses lupa sandi", error: err.message });
    }
};

// --- EKSEKUSI RESET PASSWORD BARU ---
export const resetPassword = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .message("Password baru minimal 8 karakter dan harus kombinasi huruf besar, huruf kecil, dan angka!")
            .required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { email, token, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== token) {
            return res.status(400).json({ message: "Kode token reset tidak valid atau tidak cocok!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password dan bersihkan token/otp harian
        await prisma.user.update({
            where: { email },
            data: { 
                password: hashedPassword,
                otp: null 
            }
        });

        res.status(200).json({ message: "Kata sandi Anda berhasil diperbarui! Silakan login kembali." });
    } catch (err) {
        res.status(500).json({ message: "Gagal mereset kata sandi", error: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, token } = req.body;
        if (!email || !token) return res.status(400).json({ message: "Email dan OTP wajib diisi!" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== token) {
            return res.status(400).json({ message: "Kode OTP tidak valid!" });
        }

        await prisma.user.update({
            where: { email },
            data: {
                otp: null,
                isVerified: true
            }
        });

        const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: "Verifikasi email berhasil!",
            token: jwtToken,
            user: { id: user.id, name: user.name, email: user.email, goal: user.goal }
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal memverifikasi OTP", error: err.message });
    }
};

export const login = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(404).json({ message: "Email belum terdaftar!" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Password salah!" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: "Login berhasil!",
            token,
            user: { id: user.id, name: user.name, email: user.email, goal: user.goal }
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal login", error: err.message });
    }
};
