import Banner from "../modals/bannerSchema.js";

export const addBanner = async (req, res) => {
  try {
    const { storeId, productId } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: "No image file uploaded" });
    }

    console.log("Adding Banner - raw body:", req.body);

    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'string') {
        const clean = id.trim().toLowerCase();
        if (clean === "null" || clean === "undefined" || clean === "") return null;
      }
      return id;
    };

    const normalizedStoreId = normalizeId(storeId);
    const normalizedProductId = normalizeId(productId);

    console.log("Normalized IDs:", { normalizedStoreId, normalizedProductId });

    // ❗ ensure at least one reference is provided
    if (!normalizedStoreId && !normalizedProductId) {
      return res.status(400).json({
        msg: "Either storeId or productId is required"
      });
    }

    const newBanner = new Banner({
      storeId: normalizedStoreId,
      productId: normalizedProductId,
      image: req.file.path
    });

    await newBanner.save();

    res.status(201).json({
      msg: "Banner added successfully",
      data: newBanner
    });

  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};


export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate("storeId", "storeName")
      .populate("productId", "productName price images")
      .lean();

    res.status(200).json({ data: banners });

  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findOne({
      $or: [
        { _id: id },        // search by banner id
        { storeId: id },    // search by store id
        { productId: id }   // search by product id
      ]
    })
      .populate("storeId", "storeName")
      .populate("productId", "productName price images")
      .lean();

    if (!banner) {
      return res.status(404).json({ msg: "Banner not found" });
    }

    res.status(200).json({ data: banner });

  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};



export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId, productId } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ msg: "Banner not found" });
    }

    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'string') {
        const clean = id.trim().toLowerCase();
        if (clean === "null" || clean === "undefined" || clean === "") return null;
      }
      return id;
    };

    if (storeId !== undefined) banner.storeId = normalizeId(storeId);
    if (productId !== undefined) banner.productId = normalizeId(productId);

    if (req.file) {
      banner.image = req.file.path;
    }

    await banner.save();

    res.status(200).json({
      msg: "Banner updated successfully",
      data: banner
    });

  } catch (err) {
    console.error("Banner Update Error:", err);
    res.status(400).json({ err: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ msg: "Banner not found" });
    }

    res.status(200).json({ msg: "Banner deleted successfully" });

  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

export {
  addBanner as createBanner // just an alias if needed
};
