import mongoose from 'mongoose';
import Product from './modals/productSchema.js';
import Cart from './modals/cartSchema.js';
import Order from './modals/orderSchema.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGOURI);
        console.log('Connected to MongoDB');

        // 1. Setup a test product
        const product = await Product.create({
            productName: "Test Bulk Product",
            price: 100,
            quantity: 100,
            bulkThreshold: 20,
            category: new mongoose.Types.ObjectId(), // dummy
            images: ["test.jpg"]
        });
        console.log(`Created product with stock: ${product.quantity}, threshold: ${product.bulkThreshold}`);

        const userId = new mongoose.Types.ObjectId();

        // 2. Add 5 items (Normal)
        console.log('\n--- Adding 5 items (Normal) ---');
        let cart = await Cart.create({
            userId, items: [{
                productId: product._id,
                storeId: new mongoose.Types.ObjectId(),
                quantity: 5,
                price: 100
            }], status: 'active'
        });

        // Simulate stock deduction that WOULD happen in controller
        product.quantity -= 5;
        await product.save();
        console.log(`Cart quantity: 5, Product stock: ${product.quantity} (Expected 95)`);

        // 3. Update to 25 items (Bulk)
        console.log('\n--- Updating to 25 items (Bulk) ---');
        const oldQty = 5;
        const newQty = 25;
        const threshold = product.bulkThreshold;

        // Simulate updateCartItem logic
        if (newQty > threshold && oldQty <= threshold) {
            product.quantity += oldQty; // Restore stock
        }
        await product.save();
        cart.items[0].quantity = newQty;
        await cart.save();
        console.log(`Cart quantity: 25, Product stock: ${product.quantity} (Expected 100)`);

        // 4. Update to 15 items (Normal again)
        console.log('\n--- Updating to 15 items (Normal) ---');
        const newQty2 = 15;
        const oldQty2 = 25;
        if (newQty2 <= threshold && oldQty2 > threshold) {
            product.quantity -= newQty2; // Reserved stock
        }
        await product.save();
        cart.items[0].quantity = newQty2;
        await cart.save();
        console.log(`Cart quantity: 15, Product stock: ${product.quantity} (Expected 85)`);

        // 5. Build order logic test (createOrder simulation)
        console.log('\n--- Order Creation Simulation ---');
        const hasBulkItem = cart.items[0].quantity > threshold; // false (15)
        console.log(`Has bulk item: ${hasBulkItem} (Expected false)`);

        cart.items[0].quantity = 30; // Force bulk
        const hasBulkItem2 = cart.items[0].quantity > threshold;
        let paymentMethod = hasBulkItem2 ? "PURCHASE_ORDER" : "RAZORPAY";
        console.log(`Final Payment Method: ${paymentMethod} (Expected PURCHASE_ORDER)`);

        // Cleanup
        await Product.findByIdAndDelete(product._id);
        await Cart.findByIdAndDelete(cart._id);
        await mongoose.disconnect();
        console.log('\nTest Completed Successfully');

    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

runTest();
