#!/usr/bin/env zx
const { $, cd } = require("zx");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to create the domain structure
const createDomain = async (domainName) => {
  cd(`src/domains`);

  // Create the files
  await Promise.all([
    $`touch controllers/${domainName}.controller.ts`,
    $`touch interfaces/${domainName}.interface.ts`,
    $`touch repositories/${domainName}.repositories.ts`,
    $`touch routes/${domainName}.route.ts`,
    $`touch services/${domainName}.service.ts`,
  ]);
};

// Main interaction loop
const main = async () => {
  const domainName = await new Promise((resolve) => {
    rl.question("Enter the domain name: ", (answer) => {
      resolve(answer);
      rl.close();
    });
  });
  console.log(`Creating domain ${domainName}`);
  // Create the domain
  await createDomain(domainName);
};

// Run the main function
main();
