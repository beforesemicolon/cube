import { defineConfig } from '@playwright/test'
export default defineConfig({
    testDir:'tests/browser', timeout:30000, fullyParallel:false,
    use:{baseURL:'http://127.0.0.1:4174',headless:true,screenshot:'only-on-failure'},
    webServer:[{command:'npm run dev -- --port 4174',url:'http://127.0.0.1:4174/tests/browser/fixture.html',reuseExistingServer:!process.env.CI},{command:'npx tsx scripts/serve-storybook.ts',url:'http://127.0.0.1:6006/index.json',reuseExistingServer:!process.env.CI}],
    reporter:[['list'],['html',{open:'never'}]],
})
