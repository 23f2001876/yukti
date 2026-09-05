import "reflect-metadata";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

dotenv.config();

const args = process.argv.slice(2);
function getArg(flag: string, fallback: string = ""): string {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === `--${flag}` && args[i + 1] && !args[i + 1].startsWith("--")) {
      return args[i + 1];
    }
    if (args[i].startsWith(`--${flag}=`)) {
      return args[i].slice(flag.length + 3);
    }
  }
  return fallback;
}

const hasExplicitArg = (flag: string): boolean => {
  return args.some((arg) => arg === `--${flag}` || arg.startsWith(`--${flag}=`));
};

async function seedAdmin() {
  const email = (getArg("email", process.env.ADMIN_EMAIL || "admin@yukti.com")).trim().toLowerCase();
  const password = getArg("password", process.env.ADMIN_PASSWORD || "Admin@123456");
  const name = getArg("name", "Super Admin");
  const phone = getArg("phone", "");
  const passwordProvided = hasExplicitArg("password") || Boolean(process.env.ADMIN_PASSWORD);

  console.log("=========================================");
  console.log("       Yukti SuperAdmin Seed Utility     ");
  console.log("=========================================");
  console.log(`Target Email : ${email}`);
  console.log(`Name         : ${name}`);

  try {
    if (!AppDataSource.isInitialized) {
      console.log("Connecting to database...");
      await AppDataSource.initialize();
      console.log("Database connected successfully.");
    }

    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOneBy({ email });

    if (user) {
      console.log(`\nExisting user found for '${email}'.`);
      user.isAdmin = true;
      user.name = name || user.name;
      if (phone) {
        user.phone = phone;
      }
      if (passwordProvided) {
        user.passwordHash = await bcrypt.hash(password, 10);
        console.log("Password updated to the provided credentials.");
      }
      user.updatedAt = new Date();
      await userRepository.save(user);

      console.log(`\n[SUCCESS] User '${email}' is now a SuperAdmin (isAdmin: true)!`);
    } else {
      console.log(`\nNo existing user found with '${email}'. Creating new account...`);
      const passwordHash = await bcrypt.hash(password, 10);
      user = userRepository.create({
        name,
        email,
        phone: phone || undefined,
        isAdmin: true,
        passwordHash,
      });
      await userRepository.save(user);

      console.log(`\n[SUCCESS] SuperAdmin account created successfully!`);
      console.log(`Email    : ${email}`);
      console.log(`Password : ${password}`);
    }

    console.log("=========================================");
    console.log("You can now log in at /admin/login using these credentials.");
    console.log("=========================================\n");
  } catch (err) {
    console.error("\n[ERROR] Failed to seed SuperAdmin:", err);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seedAdmin();
