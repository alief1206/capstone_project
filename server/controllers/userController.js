import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import Joi from 'joi';

const prisma = new PrismaClient();
export const updatePhysicalData = async (req, res) => {
    const schema = Joi.object({
        age: Joi.number().integer().positive().required(),
        height: Joi.number().positive().required(),
        currentWeight: Joi.number().positive().required(),
        targetWeight: Joi.number().positive().required(),
        goal: Joi.string().valid('LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN').required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const userId = req.user.id;
        const { age, height, currentWeight, targetWeight, goal } = req.body;

        if (goal === 'LOSE_WEIGHT' && targetWeight >= currentWeight) {
            return res.status(400).json({ 
                message: "Validasi Gagal: Pilihan Anda adalah menurunkan berat badan, maka target berat badan harus lebih rendah dari berat badan saat ini." 
            });
        }

        if (goal === 'GAIN_WEIGHT' && targetWeight <= currentWeight) {
            return res.status(400).json({ 
                message: "Validasi Gagal: Pilihan Anda adalah menaikkan berat badan, maka target berat badan harus lebih tinggi dari berat badan saat ini." 
            });
        }

        if (goal === 'MAINTAIN' && targetWeight !== currentWeight) {
            return res.status(400).json({ 
                message: "Validasi Gagal: Pilihan Anda adalah mempertahankan berat badan, maka target berat badan harus sama dengan berat badan saat ini." 
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { age, height, currentWeight, targetWeight, goal }
        });

        res.status(200).json({ message: "Data fisik berhasil divalidasi dan diperbarui!", data: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Gagal memperbarui data fisik", error: err.message });
    }
};