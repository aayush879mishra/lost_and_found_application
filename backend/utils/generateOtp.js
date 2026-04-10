const generateOTP = () => {
  // Generates a 6-digit string
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOTP;