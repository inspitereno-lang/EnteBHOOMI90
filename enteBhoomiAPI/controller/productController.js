import Product from "../modals/productSchema.js";


const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id in backend:", id);

    const product = await Product.findById(id)
      .populate(
        "storeId",
        "storeName address contact cuisine rating openingHours image"
      )
      .populate(
        "category",
        "name"
      )
      .lean();

    console.log("product:", product);

    if (!product) {
      return res.status(404).json({
        msg: "Product not found"
      });
    }

    // 🔄 Normalize for frontend
    const normalizedProduct = {
      _id: product._id,

      storeId: product.storeId?._id || null,
      storeName: product.storeId?.storeName || null,
      storeDetails: product.storeId || null,

      name: product.productName || product.name,
      description: product.description,

      price: product.price,
      quantity: product.quantity,
      maxQuantity: product.maxQuantity,
      categoryName: product.category?.name || null,

      image:
        product.image ||
        (product.images?.length ? product.images[0] : null),

      isAvailable: product.isAvailable,
      bulkThreshold: product.bulkThreshold || 20,
      createdAt: product.createdAt
    };

    res.status(200).json({
      msg: "Product fetched successfully",
      data: normalizedProduct
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({
      msg: "Error occurred during fetching of product",
      error: err.message
    });
  }
};



export { getProductById }