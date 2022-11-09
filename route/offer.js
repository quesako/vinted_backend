require("dotenv").config();
const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../functions/convertToBase64");

const Offer = require("../model/Offer");
const auth = require("../middleware/auth");

const cloudinary = require("cloudinary").v2;

// Données à remplacer avec les vôtres :
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Publish offer
 */

router.post("/offer/publish", auth, fileUpload(), async (req, res) => {
  try {
    // Missing parameters
    if (
      !req.body.title &&
      !req.body.description &&
      !req.body.price &&
      !req.body.condition &&
      !req.body.city &&
      !req.body.brand &&
      !req.body.size &&
      !req.body.color
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Create newOffer without image
    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          ÉTAT: condition,
        },
        {
          EMPLACEMENT: city,
        },
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          COULEUR: color,
        },
      ],
      owner: req.user,
    });

    // add image is optional
    if (req.files?.picture) {
      try {
        const cloudinaryImg = await cloudinary.uploader.upload(
          convertToBase64(req.files.picture),
          {
            folder: `/vinted/offers/${newOffer._id}`,
          }
        );
        newOffer.product_image = cloudinaryImg.secure_url;
      } catch (error) {
        return res.json({ error: error.message });
      }
    }

    await newOffer.save();

    res.status(200).json({ message: newOffer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Find offers with query
 */
router.get("/offers", async (req, res) => {
  try {
    const queryOptions = {};
    const { title, priceMax, priceMin, sort, page } = req.query;
    //query title
    if (title) {
      queryOptions.product_name = new RegExp(req.query.title, "i");
    }
    // price
    if (priceMin && priceMax) {
      queryOptions.product_price = { $gte: priceMin, $lte: priceMax };
    } else {
      if (priceMin) {
        queryOptions.product_price = { $gte: priceMin };
      }
      if (priceMax) {
        queryOptions.product_price = { $lte: priceMax };
      }
    }
    //console.log(queryOptions);

    //sortOption
    const sortOptions = {};
    if (sort === "price-desc") {
      sortOptions.product_name = -1;
    }
    if (sort === "price-asc") {
      sortOptions.product_name = 1;
    }

    // PaginateOption
    const paginateOptions = {
      page: page,
      limit: 1,
    };
    const queryOffersCounter = await Offer.find(queryOptions).count();
    const queryOffers = await Offer.find(queryOptions)
      .sort(sortOptions)
      .limit(paginateOptions.limit)
      .skip((paginateOptions.page - 1) * paginateOptions.limit)
      .select("product_name product_price -_id");

    res.status(200).json({ count: queryOffersCounter, message: queryOffers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    res.status(200).json({ message: offer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
