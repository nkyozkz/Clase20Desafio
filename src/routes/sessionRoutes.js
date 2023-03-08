import { Router } from "express";
import session from "express-session";
import userModel from "../dao/models/usersModel.js";

const router = Router();

router.get(`/login`, (req, res) => {
  res.render(`login`, {
    style: "sessions.css",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const newUser = await userModel.findOne({ email, password }).lean().exec();
  if (!newUser) {
    return res
      .status(401)
      .render("login", { error: "Usuario y/o contraseña incorrecta", style:"sessions.css" });
  }
  req.session.user = newUser;
  res.redirect("/products");
});

router.get(`/register`, (req, res) => {
  res.render(`register`, {
    style: "register.css",
  });
});
router.post("/createUser", async (req, res) => {
  const userNew = req.body;
  if (userNew.email.includes(`_admin`) && userNew.password == "SoyAdminPapa") {
    let adminUserNew = {
      ...userNew,
      rol: "admin",
    };
    const user = new userModel(adminUserNew);
    await user.save();
    return res.redirect("/session/login");
  };
  let newUser = {
    ...userNew,
    rol: "user",
  };
  const user = new userModel(newUser);
  await user.save();
  res.redirect("/session/login");
});

router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).render("error", { mensaje: err });
    } else res.redirect("/session/login");
  });
});

export default router;
