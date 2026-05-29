import dotenv from 'dotenv';
dotenv.config();
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const isEmailConfigured = Boolean(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes('email.anda') &&
    !process.env.EMAIL_PASS.includes('kode_sandi')
);

const transporter = isEmailConfigured ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}) : null;

const goalMapToDatabase = {
    turunkan: 'LOSE_WEIGHT',
    tambah: 'GAIN_WEIGHT',
    jaga: 'MAINTAIN',
    LOSE_WEIGHT: 'LOSE_WEIGHT',
    GAIN_WEIGHT: 'GAIN_WEIGHT',
    MAINTAIN: 'MAINTAIN'
};

const normalizeProfilePayload = (profile = {}) => {
    const data = {};
    if (profile.age !== undefined && profile.age !== null && profile.age !== '') data.age = Number(profile.age);
    if (profile.gender) data.gender = String(profile.gender);
    if (profile.height !== undefined && profile.height !== null && profile.height !== '') data.height = Number(profile.height);
    if (profile.currentWeight !== undefined && profile.currentWeight !== null && profile.currentWeight !== '') data.currentWeight = Number(profile.currentWeight);
    if (profile.targetWeight !== undefined && profile.targetWeight !== null && profile.targetWeight !== '') data.targetWeight = Number(profile.targetWeight);
    if (profile.activity) data.activity = String(profile.activity);
    if (Array.isArray(profile.habits)) data.habits = profile.habits;
    if (profile.goal) data.goal = goalMapToDatabase[profile.goal] || profile.goal;
    return data;
};

const serializeAuthUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    goal: user.goal,
    age: user.age,
    gender: user.gender,
    height: user.height,
    currentWeight: user.currentWeight,
    targetWeight: user.targetWeight,
    activity: user.activity,
    habits: user.habits
});

const startOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const sendMailIfConfigured = async (mailOptions) => {
    if (!transporter) return { sent: false, skipped: true };

    try {
        await transporter.sendMail(mailOptions);
        return { sent: true, skipped: false };
    } catch (error) {
        console.error('Gagal mengirim email:', error.message);
        return { sent: false, skipped: false, error };
    }
};

const withDevOtp = (payload, otpCode, mailResult) => {
    if (mailResult.sent || process.env.NODE_ENV === 'production') return payload;
    return {
        ...payload,
        message: `${payload.message} Email belum terkirim karena konfigurasi SMTP belum valid. Gunakan devOtp untuk pengujian lokal.`,
        devOtp: otpCode
    };
};

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
            .required(),
        profile: Joi.object({
            goal: Joi.string().valid('turunkan', 'tambah', 'jaga', 'LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN').optional(),
            gender: Joi.string().valid('pria', 'wanita').optional(),
            age: Joi.number().integer().positive().optional(),
            height: Joi.number().positive().optional(),
            currentWeight: Joi.number().positive().optional(),
            targetWeight: Joi.number().positive().optional(),
            activity: Joi.string().valid('rendah', 'sedang', 'aktif', 'sangat').optional(),
            habits: Joi.array().items(Joi.string()).optional()
        }).optional()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { name, password, profile = {} } = req.body;
        const email = String(req.body.email).trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                otp: null,
                isVerified: true,
                ...normalizeProfilePayload(profile)
            }
        });

        if (newUser.currentWeight) {
            await prisma.weightLog.upsert({
                where: {
                    userId_logDate: {
                        userId: newUser.id,
                        logDate: startOfDay()
                    }
                },
                update: { weight: Number(newUser.currentWeight) },
                create: {
                    userId: newUser.id,
                    weight: Number(newUser.currentWeight),
                    logDate: startOfDay()
                }
            });
        }

        const jwtToken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: "Registrasi berhasil! Akun langsung aktif tanpa verifikasi email.",
            email: newUser.email,
            token: jwtToken,
            user: serializeAuthUser(newUser)
        });
    } catch (err) {
        res.status(500).json({ message: "Kesalahan server internal", error: err.message });
    }
};

// --- FITUR LUPA SANDI (KIRIM EMAIL RESET) ---
export const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
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
        const mailResult = await sendMailIfConfigured({
            from: `"EatSistent Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Atur Ulang Kata Sandi EatSistent",
            html: `<h3>Permintaan Reset Password</h3>
                   <p>Gunakan kode berikut untuk mengatur ulang kata sandi akun EatSistent Anda:</p>
                   <h2><b>${resetToken}</b></h2>
                   <p>Jika Anda tidak meminta ini, abaikan email ini.</p>`
        });

        res.status(200).json(withDevOtp({
            message: "Kode reset password berhasil dikirim ke Gmail Anda!"
        }, resetToken, mailResult));
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
        const email = String(req.body.email || '').trim().toLowerCase();
        const { token, newPassword } = req.body;

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
        const email = String(req.body.email || '').trim().toLowerCase();
        const token = String(req.body.token || '').trim();
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
            user: serializeAuthUser({ ...user, isVerified: true, otp: null })
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
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(404).json({ message: "Email belum terdaftar!" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Password salah!" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: "Login berhasil!",
            token,
            user: serializeAuthUser(user)
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal login", error: err.message });
    }
};
