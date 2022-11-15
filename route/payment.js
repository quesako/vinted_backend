require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Offer = require("../model/Offer");
const auth = require("../middleware/auth");


/**
 * Publish offer
 */
router.post("/payment", auth, async (req, res) => {
    try {
        // Réception du token créer via l'API Stripe depuis le Frontend
        const {stripeToken, amount, productTitle} = req.body;
        // Créer la transaction
        const response = await stripe.charges.create({
            amount: amount,
            currency: "eur",
            description: productTitle,
            // On envoie ici le token
            source: stripeToken,
        });
        console.log(response.status);
        res.status(200).json(response);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;
