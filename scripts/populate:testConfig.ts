import * as fs from "node:fs"
import * as path from "node:path"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

const main = async () => {
  // Read the template file
  const templatePath = path.join(process.cwd(), "config", "test-example.json")
  const outputPath = path.join(process.cwd(), "config", "test.json")

  let template = fs.readFileSync(templatePath, "utf8")

  // ... existing code ...
  const envVars = [
    "ALCHEMY_KEY",
    "QUICKNODE_BSC_KEY",
    "QUICKNODE_BSC_TESTNET_KEY",
    "QUICKNODE_AVAX_KEY",
    "QUICKNODE_AVAX_TESTNET_KEY",
    "INFURA_KEY",
    "MANTLE_KEY",
    "ANKR_KEY_ONE",
    "ANKR_KEY_TWO",
    "ANKR_KEY_THREE",
    "NODEREAL_KEY",
    "BLAST_KEY_ONE",
    "BLAST_KEY_TWO",
    "QUICKNODE_BLAST_SEPOLIA_KEY",
    "QUICKNODE_BLAST_KEY",
    "GOLD_KEY",
    "XLAYER_KEY",
    "CONDUIT_KEY"
  ]

  for (const varName of envVars) {
    const value = process.env[varName]
    if (!value) {
      console.warn(`Warning: Environment variable ${varName} is not set`)
      return
    }
    template = template.replace(new RegExp(`\\\${${varName}}`, "g"), value)
  }

  // Write the populated config
  fs.writeFileSync(outputPath, template)
  console.log("Successfully populated test.json with environment variables")
}

main().catch((error) => {
  console.error("Error populating test config:", error)
  process.exit(1)
})
