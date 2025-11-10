import colors from "./colors";

export const logger = {
  info(message: string) {
    console.log(colors.blue("ℹ"), message);
  },

  success(message: string) {
    console.log(colors.green("✔"), message);
  },

  warn(message: string) {
    console.log(colors.yellow("⚠"), message);
  },

  error(message: string) {
    console.error(colors.red("✖"), message);
  },

  debug(message: string) {
    console.log(colors.gray("⚙"), message);
  },
};

export default logger;
