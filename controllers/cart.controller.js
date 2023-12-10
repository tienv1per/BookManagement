
const cart = require("../models/cart.model");
exports.addToCart = async (req, res) => {
  if (
    typeof req.body.id_user === "undefined" ||
    typeof req.body.products === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }

  const { id_user, products } = req.body;

try {
  let cartFind = await cart.findOne({ id_user: id_user });

  if (cartFind === null) {
    // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới
    const cart_new = new cart({
      id_user: id_user,
      products: products,
    });

    try {
      await cart_new.save();
      res.status(200).json({ msg: 'Product(s) added to cart successfully' });
    } catch (err) {
      res.status(500).json({ msg: err });
    }

    return;
  }

  // Nếu giỏ hàng đã tồn tại, cập nhật thông tin sản phẩm
  for (let i = 0; i < products.length; i++) {
    let index = cartFind.products.findIndex(
      (element) => products[i].name === element.name
    );

    if (index === -1) {
      // Nếu sản phẩm không tồn tại trong giỏ hàng, thêm mới vào mảng products
      cartFind.products.push(products[i]);
    } else {
      // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
      cartFind.products[index].count += Number(products[i].count);
    }
  }

  // Lưu lại giỏ hàng sau khi cập nhật thông tin sản phẩm
  try {
    await cartFind.save();
    res.status(200).json({ msg: 'Product(s) added to cart successfully' });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
} catch (err) {
  res.status(500).json({ msg: err });
}

  }




  exports.getAll = async (req, res) => {
    try {
      if (typeof req.params.id_user === "undefined") {
        res.status(422).json({ msg: "invalid data" });
        return;
      }
  
      const docs = await cart.findOne({ id_user: req.params.id_user }).exec();
  
      if (!docs) {
        res.status(404).json({ msg: "No data found" });
        return;
      }
  
      res.status(200).json({ data: docs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };


exports.update = async (req, res) => {
  if (
    typeof req.body.id_user === "undefined" ||
    typeof req.body.product === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }

const { id_user, product } = req.body;

try {
  let cartFind = await cart.findOne({ id_user: id_user });

  if (cartFind === null) {
    // Nếu giỏ hàng không tồn tại, trả về mã lỗi 404
    res.status(404).json({ msg: 'Cart not found' });
    return;
  }

  // Tìm kiếm sản phẩm trong mảng products của giỏ hàng
  let index = cartFind.products.findIndex(
    (element) => element.name === product.name
  );

  if (index === -1) {
    // Nếu sản phẩm không tồn tại trong giỏ hàng, trả về mã lỗi 404
    res.status(404).json({ msg: 'Product not found in cart' });
    return;
  }

  // Cập nhật số lượng của sản phẩm
  cartFind.products[index].count = Number(product.count);

  // Lưu lại giỏ hàng sau khi cập nhật thông tin sản phẩm
  try {
    await cartFind.save();
    res.status(200).json({ msg: 'Update success' });
  } catch (err) {
    res.status(500).json({ msg: err });
  }
} catch (err) {
  res.status(500).json({ msg: err });
}

};

exports.delete = async (req, res) => {
  if (
    typeof req.body.id_user === "undefined" ||
    typeof req.body.name === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user, name } = req.body;

  try {
    let cartFind = await cart.findOne({ id_user: id_user });
  
    if (cartFind === null) {
      // Nếu giỏ hàng không tồn tại, trả về mã lỗi 404
      res.status(404).json({ msg: 'Cart not found' });
      return;
    }
  
    // Tìm kiếm sản phẩm trong mảng products của giỏ hàng
    let index = cartFind.products.findIndex((element) => element.name === name);
  
    if (index === -1) {
      // Nếu sản phẩm không tồn tại trong giỏ hàng, trả về mã lỗi 404
      res.status(404).json({ msg: 'Product not found in cart' });
      return;
    }
  
    // Xóa sản phẩm khỏi mảng products
    cartFind.products.splice(index, 1);
  
    // Lưu lại giỏ hàng sau khi xóa sản phẩm
    try {
      await cartFind.save();
      res.status(200).json({ msg: 'Delete success' });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
  
};

exports.removeCartByIDUser = async (id_user) => {
  try {
    cartFind = await cart.findOne({ id_user: id_user });
  } catch (err) {
    console.log(err)
    return false;
  }
  try {
    await cartFind.remove();
  }
  catch(err) {
    console.log(err);
    return false;
  }
  return true;
}