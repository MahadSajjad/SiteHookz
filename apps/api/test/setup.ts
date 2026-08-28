import { config } from "dotenv";

// Load environment variables for tests
config({ path: ".env.test" });

// Increase default timeout for integration tests
jest.setTimeout(30000);
