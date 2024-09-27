const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

// Khởi tạo Firestore
const db = admin.firestore();

// Đăng ký người dùng
exports.register = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng trong Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: hashedPassword,
      displayName: fullName,
    });

    // Lưu thông tin người dùng vào Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email: email,
      fullName: fullName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: userRecord });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Lấy thông tin người dùng từ Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return res.status(400).json({ error: "User not found" });
    }

    // Xác thực mật khẩu (đối với Firebase Authentication, mật khẩu không thể so sánh trực tiếp)
    // Lưu ý: Để xác thực mật khẩu, bạn nên sử dụng Firebase client SDK (trong frontend).
    // Ví dụ sử dụng Firebase Client SDK để xác thực mật khẩu:
    // const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const isPasswordValid = await bcrypt.compare(password, userRecord.password); // Cần chỉnh sửa để không sử dụng mật khẩu từ Firestore.

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Xác thực thành công, trả về thông tin người dùng
    res.status(200).json({ message: "Login successful", user: userRecord });
  } catch (error) {
    res.status(500).json({ error: "Error logging in: " + error.message });
  }
};
