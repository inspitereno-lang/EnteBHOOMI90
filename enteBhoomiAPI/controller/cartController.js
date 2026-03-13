import Cart from "../modals/cartSchema.js";
import Order from "../modals/orderSchema.js";
import Product from "../modals/productSchema.js";


// NEW: Sync localStorage cart with database after login
const syncCart = async (req, res) => {
  const userId = req.user._id;
  const { items } = req.body; // Expecting [{ productId, quantity }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(200).json({ msg: "No items to sync", data: [] });
  }

  try {
    let cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      cart = new Cart({ userId, items: [], status: "active" });
    }

    let actualSyncedCount = 0;
    for (const item of items) {
      const { productId, quantity = 1 } = item;

      const existingItem = cart.items.find(i => i.productId.toString() === productId);
      if (existingItem) continue;

      const product = await Product.findById(productId);
      if (product && product.isAvailable) {
        const threshold = product.bulkThreshold || 20;
        const isBulk = quantity > threshold;

        // Allow sync if it's either bulk OR there is enough stock
        if (isBulk || product.quantity >= quantity) {
          // ONLY reserve stock if NOT bulk
          if (!isBulk) {
            product.quantity -= quantity;
            await product.save();
          }

          cart.items.push({
            productId,
            storeId: product.storeId,
            quantity,
            price: product.price
          });
          actualSyncedCount++;
        }
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      populate: { path: "storeId", select: "storeName" }
    });

    res.status(200).json({
      msg: "Cart synced successfully",
      data: populatedCart,
      syncedCount: actualSyncedCount,
    });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(400).json({ msg: "Failed to sync cart", error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "productIds must be a non-empty array",
      });
    }

    // 1️⃣ Get or create active cart for user
    let cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      cart = new Cart({ userId, items: [], status: "active" });
    }

    const added = [];
    const failed = [];

    for (const productId of productIds) {
      const product = await Product.findById(productId);

      if (!product) {
        failed.push({ productId, reason: "Product not found" });
        continue;
      }

      // Check if it's already bulk or becoming bulk
      const cartItem = cart.items.find((item) => item.productId.toString() === productId);
      const nextQuantity = (cartItem?.quantity || 0) + 1;
      const threshold = product.bulkThreshold || 20;
      const isBulk = nextQuantity > threshold;

      // Only block if NOT bulk and out of stock
      if (!isBulk && product.quantity <= 0) {
        failed.push({ productId, reason: "Out of stock" });
        continue;
      }

      if (cartItem) {
        // 🔼 Increase quantity
        cartItem.quantity += 1;
      } else {
        // ➕ Add new item to cart
        cart.items.push({
          productId,
          storeId: product.storeId,
          quantity: 1,
          price: product.price,
        });
      }

      // 🔻 Reduce product stock (ONLY if not a bulk enquiry)
      if (cartItem) {
        if (cartItem.quantity <= threshold) {
          // Both before and after are normal → decrement 1
          product.quantity -= 1;
        } else if (cartItem.quantity === (threshold + 1)) {
          // Just crossed into bulk! Restore the "normal" threshold stock that was held.
          product.quantity += threshold;
        }
        // If already > (threshold + 1), it was already bulk, no stock held.
      } else {
        // New item - only decrement if starting quantity is normal
        if (1 <= threshold) {
          product.quantity -= 1;
        }
      }

      await product.save();

      added.push(productId);
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      msg: "Cart updated successfully",
      cart,
      added,
      failed,
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};



const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // Using 'id' for productId to match route

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === id);
    if (itemIndex === -1) return res.status(404).json({ msg: "Item not found in cart" });

    const cartItem = cart.items[itemIndex];
    const product = await Product.findById(id);

    if (product) {
      const threshold = product.bulkThreshold || 20;
      // ONLY restore stock if it was a normal order
      if (cartItem.quantity <= threshold) {
        product.quantity += cartItem.quantity;
        await product.save();
      }
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ success: true, msg: "Item removed and stock updated", cart });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ msg: "Error removing from cart", error: err.message });
  }
};

// Make sure to import your Order model at the top
// const Order = require('../models/Order'); 

const getCartItems = async (req, res) => {
  const userId = req.user._id;

  try {
    // 1️⃣ Fetch ONLY active cart
    const cart = await Cart.findOne({
      userId,
      status: "active",
    })
      .populate({
        path: "items.productId",
        select: "productName images price storeId bulkThreshold",
        populate: {
          path: "storeId",
          select: "storeName",
        },
      })
      .lean();

    // 2️⃣ If no cart OR empty cart → return empty
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        msg: "Cart is empty",
        data: {
          userId,
          status: "active",
          totalItems: 0,
          cartTotalPrice: 0,
          items: [],
        },
      });
    }

    // 3️⃣ Build cart items
    const items = cart.items.map(item => ({
      productId: item.productId?._id,
      productName: item.productId?.productName,
      image: item.productId?.images?.[0] || null,

      storeId: item.productId?.storeId?._id,
      storeName: item.productId?.storeId?.storeName,

      quantity: item.quantity,
      price: item.price,
      totalPrice: item.quantity * item.price,
      bulkThreshold: item.productId?.bulkThreshold || 20,
    }));

    const cartTotalPrice = items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // 4️⃣ Success response
    res.status(200).json({
      success: true,
      msg: "Cart fetched successfully",
      data: {
        userId: cart.userId,
        status: cart.status,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
        totalItems: items.length,
        cartTotalPrice,
        items,
      },
    });

  } catch (err) {
    console.error("Error fetching cart items:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch cart items",
      error: err.message,
    });
  }
};


const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity == null) {
      return res.status(400).json({ msg: "Quantity is required" });
    }

    // 🔍 Find active cart
    const cart = await Cart.findOne({
      userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // 🔍 Find item inside cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Cart item not found" });
    }

    const cartItem = cart.items[itemIndex];

    // 🔍 Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    /**
     * 🗑 Remove item if quantity <= 0
     */
    if (quantity <= 0) {
      const threshold = product.bulkThreshold || 20;
      // ONLY restore if it was a normal order
      if (cartItem.quantity <= threshold) {
        product.quantity += cartItem.quantity;
        await product.save();
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      return res.status(200).json({
        success: true,
        msg: "Item removed from cart",
      });
    }

    /**
     * Bulk Order vs Normal Order Logic
     * > bulkThreshold: Bulk enquiry (No stock decrement)
     * <= bulkThreshold: Normal order (Stock reserved)
     */
    const threshold = product.bulkThreshold || 20;
    const isBulk = quantity > threshold;
    const wasBulk = cartItem.quantity > threshold;

    if (isBulk) {
      if (!wasBulk) {
        // Restoring previously held stock (since it was <= threshold before)
        product.quantity += cartItem.quantity;
      }
      // If wasBulk, we already weren't holding stock, so no change to product.quantity
    } else {
      // Normal order (<= threshold)
      const stockToAdjust = wasBulk ? quantity : (quantity - cartItem.quantity);

      if (stockToAdjust > 0 && product.quantity < stockToAdjust) {
        return res.status(400).json({ msg: "Not enough stock available" });
      }
      product.quantity -= stockToAdjust;
    }

    await product.save();

    // Update cart item quantity
    cartItem.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      success: true,
      msg: "Cart item updated successfully",
      data: {
        productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        totalPrice: cartItem.quantity * cartItem.price,
      },
    });

  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};


export { addToCart, removeFromCart, getCartItems, updateCartItem, syncCart };
