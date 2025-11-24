// Test script for Lab 03-04: Search Endpoints
// Tests all search, filter, sort, and pagination features for users and bugs endpoints

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';

// Initialize fetch - will be set in runTests
let fetch;

let authCookie = null;
let testUserId = null;
let testBugIds = [];

// Helper function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authCookie) {
        headers['Cookie'] = authCookie;
    }

    return fetch(url, {
        ...options,
        headers
    });
}

// Helper function to extract cookies from response
function extractCookies(response) {
    // Handle both single string and array of set-cookie headers
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
        // set-cookie can be a single string or comma-separated
        const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        for (const cookie of cookies) {
            const sessionIdMatch = cookie.match(/sessionId=([^;]+)/);
            if (sessionIdMatch) {
                authCookie = `sessionId=${sessionIdMatch[1]}`;
                break;
            }
        }
    }
}

// Test result tracking
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.log(`❌ ${message}`);
        testsFailed++;
    }
}

function assertEqual(actual, expected, message) {
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    if (passed) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.log(`❌ ${message} - Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
        testsFailed++;
    }
}

function assertArrayLength(arr, expectedLength, message) {
    const passed = arr.length === expectedLength;
    if (passed) {
        console.log(`✅ ${message} - Found ${arr.length} items`);
        testsPassed++;
    } else {
        console.log(`❌ ${message} - Expected ${expectedLength} items, got ${arr.length}`);
        testsFailed++;
    }
}

function assertGreaterThanOrEqual(actual, expected, message) {
    const passed = actual >= expected;
    if (passed) {
        console.log(`✅ ${message}`);
        testsPassed++;
    } else {
        console.log(`❌ ${message} - Expected >= ${expected}, Got ${actual}`);
        testsFailed++;
    }
}

// Setup: Create test user and login
async function setup() {
    console.log('\n=== SETUP: Creating test user and logging in ===\n');

    try {
        // Register a test user
        const registerResponse = await fetch(`${BASE_URL}/auth/sign-up/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test-search-${Date.now()}@example.com`,
                password: 'password123',
                givenName: 'Search',
                familyName: 'Tester',
                role: ['Developer', 'Quality Analyst']
            })
        });

        extractCookies(registerResponse);

        if (registerResponse.ok) {
            const data = await registerResponse.json();
            testUserId = data.userId;
            console.log('✅ Test user created');
        } else {
            // Try to login if user already exists
            const loginResponse = await fetch(`${BASE_URL}/auth/sign-in/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test-search@example.com',
                    password: 'password123'
                })
            });
            extractCookies(loginResponse);
            if (loginResponse.ok) {
                console.log('✅ Using existing test user');
            } else {
                throw new Error('Failed to create or login test user');
            }
        }

        // Create some test bugs for testing
        console.log('Creating test bugs...');
        const bugTitles = [
            'Critical bug in login system',
            'Feature request for dark mode',
            'Enhancement: Add search functionality',
            'Documentation: Update API docs',
            'Bug: Memory leak in dashboard'
        ];

        const classifications = ['bug', 'feature', 'enhancement', 'documentation', 'bug'];
        const closedStates = [false, false, false, true, true];

        for (let i = 0; i < bugTitles.length; i++) {
            const bugResponse = await authenticatedFetch(`${BASE_URL}/bugs`, {
                method: 'POST',
                body: JSON.stringify({
                    title: bugTitles[i],
                    description: `Test bug ${i + 1} description`,
                    stepsToReproduce: `Step 1, Step 2, Step 3`
                })
            });

            if (bugResponse.ok) {
                const bugData = await bugResponse.json();
                testBugIds.push(bugData.bugId);

                // Classify the bug
                if (classifications[i] !== 'unclassified') {
                    await authenticatedFetch(`${BASE_URL}/bugs/${bugData.bugId}/classify`, {
                        method: 'PATCH',
                        body: JSON.stringify({ classification: classifications[i] })
                    });
                }

                // Close some bugs
                if (closedStates[i]) {
                    await authenticatedFetch(`${BASE_URL}/bugs/${bugData.bugId}/close`, {
                        method: 'PATCH',
                        body: JSON.stringify({ closed: true })
                    });
                }
            }
        }

        console.log(`✅ Created ${testBugIds.length} test bugs\n`);

    } catch (error) {
        console.error('Setup failed:', error.message);
        throw error;
    }
}

// Test User Endpoint Features
async function testUserEndpoint() {
    console.log('\n=== TESTING USER ENDPOINT (GET /api/users) ===\n');

    // Test 1: Basic endpoint access
    console.log('Test 1: Basic endpoint access');
    const basicResponse = await authenticatedFetch(`${BASE_URL}/users`);
    assert(basicResponse.ok, 'User endpoint is accessible');
    const basicUsers = await basicResponse.json();
    assert(Array.isArray(basicUsers), 'Response is an array');
    assertGreaterThanOrEqual(basicUsers.length, 1, 'At least one user returned');

    // Test 2: Keywords search
    console.log('\nTest 2: Keywords search');
    const keywordsResponse = await authenticatedFetch(`${BASE_URL}/users?keywords=Search`);
    assert(keywordsResponse.ok, 'Keywords search works');
    const keywordsUsers = await keywordsResponse.json();
    assert(Array.isArray(keywordsUsers), 'Keywords search returns array');

    // Test 3: Role filtering
    console.log('\nTest 3: Role filtering');
    const roleResponse = await authenticatedFetch(`${BASE_URL}/users?role=Developer`);
    assert(roleResponse.ok, 'Role filter works');
    const roleUsers = await roleResponse.json();
    assert(Array.isArray(roleUsers), 'Role filter returns array');
    if (roleUsers.length > 0) {
        assert(Array.isArray(roleUsers[0].role) && roleUsers[0].role.includes('Developer'),
            'Filtered users have Developer role');
    }

    // Test 4: maxAge filtering
    console.log('\nTest 4: maxAge filtering (users created in last 365 days)');
    const maxAgeResponse = await authenticatedFetch(`${BASE_URL}/users?maxAge=365`);
    assert(maxAgeResponse.ok, 'maxAge filter works');
    const maxAgeUsers = await maxAgeResponse.json();
    assert(Array.isArray(maxAgeUsers), 'maxAge filter returns array');

    // Test 5: minAge filtering
    console.log('\nTest 5: minAge filtering (users older than 0 days)');
    const minAgeResponse = await authenticatedFetch(`${BASE_URL}/users?minAge=0`);
    assert(minAgeResponse.ok, 'minAge filter works');
    const minAgeUsers = await minAgeResponse.json();
    assert(Array.isArray(minAgeUsers), 'minAge filter returns array');

    // Test 6: Sort by givenName
    console.log('\nTest 6: Sort by givenName');
    const sortGivenNameResponse = await authenticatedFetch(`${BASE_URL}/users?sortBy=givenName`);
    assert(sortGivenNameResponse.ok, 'Sort by givenName works');
    const sortGivenNameUsers = await sortGivenNameResponse.json();
    if (sortGivenNameUsers.length > 1) {
        const sorted = sortGivenNameUsers.every((user, i) =>
            i === 0 || user.givenName >= sortGivenNameUsers[i - 1].givenName
        );
        assert(sorted, 'Users are sorted by givenName ascending');
    }

    // Test 7: Sort by familyName
    console.log('\nTest 7: Sort by familyName');
    const sortFamilyNameResponse = await authenticatedFetch(`${BASE_URL}/users?sortBy=familyName`);
    assert(sortFamilyNameResponse.ok, 'Sort by familyName works');
    const sortFamilyNameUsers = await sortFamilyNameResponse.json();
    if (sortFamilyNameUsers.length > 1) {
        const sorted = sortFamilyNameUsers.every((user, i) =>
            i === 0 || user.familyName >= sortFamilyNameUsers[i - 1].familyName
        );
        assert(sorted, 'Users are sorted by familyName ascending');
    }

    // Test 8: Sort by role
    console.log('\nTest 8: Sort by role');
    const sortRoleResponse = await authenticatedFetch(`${BASE_URL}/users?sortBy=role`);
    assert(sortRoleResponse.ok, 'Sort by role works');
    const sortRoleUsers = await sortRoleResponse.json();
    assert(Array.isArray(sortRoleUsers), 'Sort by role returns array');

    // Test 9: Sort by newest
    console.log('\nTest 9: Sort by newest');
    const sortNewestResponse = await authenticatedFetch(`${BASE_URL}/users?sortBy=newest`);
    assert(sortNewestResponse.ok, 'Sort by newest works');
    const sortNewestUsers = await sortNewestResponse.json();
    if (sortNewestUsers.length > 1) {
        // Check that dates are in descending order (newest first)
        let sorted = true;
        for (let i = 1; i < sortNewestUsers.length; i++) {
            const currentDate = new Date(sortNewestUsers[i].createdOn);
            const prevDate = new Date(sortNewestUsers[i - 1].createdOn);
            if (currentDate > prevDate) {
                sorted = false;
                break;
            }
        }
        assert(sorted, 'Users are sorted by createdOn descending (newest first)');
    } else {
        assert(true, 'Users are sorted by createdOn descending (newest first) - only one user');
    }

    // Test 10: Sort by oldest
    console.log('\nTest 10: Sort by oldest');
    const sortOldestResponse = await authenticatedFetch(`${BASE_URL}/users?sortBy=oldest`);
    assert(sortOldestResponse.ok, 'Sort by oldest works');
    const sortOldestUsers = await sortOldestResponse.json();
    if (sortOldestUsers.length > 1) {
        // Check that dates are in ascending order (oldest first)
        let sorted = true;
        for (let i = 1; i < sortOldestUsers.length; i++) {
            const currentDate = new Date(sortOldestUsers[i].createdOn);
            const prevDate = new Date(sortOldestUsers[i - 1].createdOn);
            if (currentDate < prevDate) {
                sorted = false;
                break;
            }
        }
        assert(sorted, 'Users are sorted by createdOn ascending (oldest first)');
    } else {
        assert(true, 'Users are sorted by createdOn ascending (oldest first) - only one user');
    }

    // Test 11: Default sort (givenName)
    console.log('\nTest 11: Default sort (givenName)');
    const defaultSortResponse = await authenticatedFetch(`${BASE_URL}/users`);
    assert(defaultSortResponse.ok, 'Default sort works');
    const defaultSortUsers = await defaultSortResponse.json();
    if (defaultSortUsers.length > 1) {
        const sorted = defaultSortUsers.every((user, i) =>
            i === 0 || user.givenName >= defaultSortUsers[i - 1].givenName
        );
        assert(sorted, 'Default sort is by givenName');
    }

    // Test 12: Pagination - pageSize
    console.log('\nTest 12: Pagination - pageSize');
    const pageSizeResponse = await authenticatedFetch(`${BASE_URL}/users?pageSize=2`);
    assert(pageSizeResponse.ok, 'pageSize parameter works');
    const pageSizeUsers = await pageSizeResponse.json();
    assertArrayLength(pageSizeUsers, 2, 'pageSize limits results correctly');

    // Test 13: Pagination - pageNumber
    console.log('\nTest 13: Pagination - pageNumber');
    const page1Response = await authenticatedFetch(`${BASE_URL}/users?pageSize=2&pageNumber=1`);
    const page2Response = await authenticatedFetch(`${BASE_URL}/users?pageSize=2&pageNumber=2`);
    assert(page1Response.ok && page2Response.ok, 'pageNumber parameter works');
    const page1Users = await page1Response.json();
    const page2Users = await page2Response.json();
    if (page1Users.length > 0 && page2Users.length > 0) {
        assert(page1Users[0]._id !== page2Users[0]._id, 'Different pages return different results');
    }

    // Test 14: Combined filters
    console.log('\nTest 14: Combined filters (keywords + role + sort)');
    const combinedResponse = await authenticatedFetch(`${BASE_URL}/users?keywords=Test&role=Developer&sortBy=newest&pageSize=5`);
    assert(combinedResponse.ok, 'Combined filters work');
    const combinedUsers = await combinedResponse.json();
    assert(Array.isArray(combinedUsers), 'Combined filters return array');
    assert(combinedUsers.length <= 5, 'Combined filters respect pageSize (results <= pageSize)');
}

// Test Bug Endpoint Features
async function testBugEndpoint() {
    console.log('\n=== TESTING BUG ENDPOINT (GET /api/bugs) ===\n');

    // Test 1: Basic endpoint access
    console.log('Test 1: Basic endpoint access');
    const basicResponse = await authenticatedFetch(`${BASE_URL}/bugs`);
    assert(basicResponse.ok, 'Bug endpoint is accessible');
    const basicBugs = await basicResponse.json();
    assert(Array.isArray(basicBugs), 'Response is an array');
    assertGreaterThanOrEqual(basicBugs.length, 1, 'At least one bug returned');

    // Test 2: Keywords search
    console.log('\nTest 2: Keywords search');
    const keywordsResponse = await authenticatedFetch(`${BASE_URL}/bugs?keywords=bug`);
    assert(keywordsResponse.ok, 'Keywords search works');
    const keywordsBugs = await keywordsResponse.json();
    assert(Array.isArray(keywordsBugs), 'Keywords search returns array');

    // Test 3: Classification filtering
    console.log('\nTest 3: Classification filtering');
    const classificationResponse = await authenticatedFetch(`${BASE_URL}/bugs?classification=bug`);
    assert(classificationResponse.ok, 'Classification filter works');
    const classificationBugs = await classificationResponse.json();
    assert(Array.isArray(classificationBugs), 'Classification filter returns array');
    if (classificationBugs.length > 0) {
        assert(classificationBugs.every(bug => bug.classification === 'bug'),
            'All filtered bugs have correct classification');
    }

    // Test 4: maxAge filtering
    console.log('\nTest 4: maxAge filtering (bugs created in last 365 days)');
    const maxAgeResponse = await authenticatedFetch(`${BASE_URL}/bugs?maxAge=365`);
    assert(maxAgeResponse.ok, 'maxAge filter works');
    const maxAgeBugs = await maxAgeResponse.json();
    assert(Array.isArray(maxAgeBugs), 'maxAge filter returns array');

    // Test 5: minAge filtering
    console.log('\nTest 5: minAge filtering (bugs older than 0 days)');
    const minAgeResponse = await authenticatedFetch(`${BASE_URL}/bugs?minAge=0`);
    assert(minAgeResponse.ok, 'minAge filter works');
    const minAgeBugs = await minAgeResponse.json();
    assert(Array.isArray(minAgeBugs), 'minAge filter returns array');

    // Test 6: Closed filter - true
    console.log('\nTest 6: Closed filter - show only closed bugs');
    const closedTrueResponse = await authenticatedFetch(`${BASE_URL}/bugs?closed=true`);
    assert(closedTrueResponse.ok, 'Closed=true filter works');
    const closedTrueBugs = await closedTrueResponse.json();
    assert(Array.isArray(closedTrueBugs), 'Closed=true filter returns array');
    if (closedTrueBugs.length > 0) {
        assert(closedTrueBugs.every(bug => bug.closed === true),
            'All filtered bugs are closed');
    }

    // Test 7: Closed filter - false
    console.log('\nTest 7: Closed filter - show only open bugs');
    const closedFalseResponse = await authenticatedFetch(`${BASE_URL}/bugs?closed=false`);
    assert(closedFalseResponse.ok, 'Closed=false filter works');
    const closedFalseBugs = await closedFalseResponse.json();
    assert(Array.isArray(closedFalseBugs), 'Closed=false filter returns array');
    if (closedFalseBugs.length > 0) {
        assert(closedFalseBugs.every(bug => bug.closed === false),
            'All filtered bugs are open');
    }

    // Test 8: Sort by newest (default)
    console.log('\nTest 8: Sort by newest (default)');
    const sortNewestResponse = await authenticatedFetch(`${BASE_URL}/bugs?sortBy=newest`);
    assert(sortNewestResponse.ok, 'Sort by newest works');
    const sortNewestBugs = await sortNewestResponse.json();
    if (sortNewestBugs.length > 1) {
        // Check that dates are in descending order (newest first)
        let sorted = true;
        for (let i = 1; i < sortNewestBugs.length; i++) {
            const currentDate = new Date(sortNewestBugs[i].createdOn);
            const prevDate = new Date(sortNewestBugs[i - 1].createdOn);
            if (currentDate > prevDate) {
                sorted = false;
                break;
            }
        }
        assert(sorted, 'Bugs are sorted by createdOn descending (newest first)');
    } else {
        assert(true, 'Bugs are sorted by createdOn descending (newest first) - only one bug');
    }

    // Test 9: Sort by oldest
    console.log('\nTest 9: Sort by oldest');
    const sortOldestResponse = await authenticatedFetch(`${BASE_URL}/bugs?sortBy=oldest`);
    assert(sortOldestResponse.ok, 'Sort by oldest works');
    const sortOldestBugs = await sortOldestResponse.json();
    if (sortOldestBugs.length > 1) {
        // Check that dates are in ascending order (oldest first)
        let sorted = true;
        for (let i = 1; i < sortOldestBugs.length; i++) {
            const currentDate = new Date(sortOldestBugs[i].createdOn);
            const prevDate = new Date(sortOldestBugs[i - 1].createdOn);
            if (currentDate < prevDate) {
                sorted = false;
                break;
            }
        }
        assert(sorted, 'Bugs are sorted by createdOn ascending (oldest first)');
    } else {
        assert(true, 'Bugs are sorted by createdOn ascending (oldest first) - only one bug');
    }

    // Test 10: Sort by title
    console.log('\nTest 10: Sort by title');
    const sortTitleResponse = await authenticatedFetch(`${BASE_URL}/bugs?sortBy=title`);
    assert(sortTitleResponse.ok, 'Sort by title works');
    const sortTitleBugs = await sortTitleResponse.json();
    if (sortTitleBugs.length > 1) {
        const sorted = sortTitleBugs.every((bug, i) =>
            i === 0 || bug.title.toLowerCase() >= sortTitleBugs[i - 1].title.toLowerCase()
        );
        assert(sorted, 'Bugs are sorted by title ascending');
    }

    // Test 11: Sort by classification
    console.log('\nTest 11: Sort by classification');
    const sortClassificationResponse = await authenticatedFetch(`${BASE_URL}/bugs?sortBy=classification`);
    assert(sortClassificationResponse.ok, 'Sort by classification works');
    const sortClassificationBugs = await sortClassificationResponse.json();
    if (sortClassificationBugs.length > 1) {
        const sorted = sortClassificationBugs.every((bug, i) =>
            i === 0 || bug.classification >= sortClassificationBugs[i - 1].classification
        );
        assert(sorted, 'Bugs are sorted by classification ascending');
    }

    // Test 12: Sort by assignedTo
    console.log('\nTest 12: Sort by assignedTo');
    const sortAssignedToResponse = await authenticatedFetch(`${BASE_URL}/bugs?sortBy=assignedTo`);
    assert(sortAssignedToResponse.ok, 'Sort by assignedTo works');
    const sortAssignedToBugs = await sortAssignedToResponse.json();
    assert(Array.isArray(sortAssignedToBugs), 'Sort by assignedTo returns array');

    // Test 13: Sort by createdBy
    console.log('\nTest 13: Sort by createdBy');
    const sortCreatedByResponse = await authenticatedFetch(`${BASE_URL}/bugs?sortBy=createdBy`);
    assert(sortCreatedByResponse.ok, 'Sort by createdBy works');
    const sortCreatedByBugs = await sortCreatedByResponse.json();
    assert(Array.isArray(sortCreatedByBugs), 'Sort by createdBy returns array');

    // Test 14: Default sort (newest)
    console.log('\nTest 14: Default sort (newest)');
    const defaultSortResponse = await authenticatedFetch(`${BASE_URL}/bugs`);
    assert(defaultSortResponse.ok, 'Default sort works');
    const defaultSortBugs = await defaultSortResponse.json();
    if (defaultSortBugs.length > 1) {
        // Check that dates are in descending order (newest first)
        let sorted = true;
        for (let i = 1; i < defaultSortBugs.length; i++) {
            const currentDate = new Date(defaultSortBugs[i].createdOn);
            const prevDate = new Date(defaultSortBugs[i - 1].createdOn);
            if (currentDate > prevDate) {
                sorted = false;
                break;
            }
        }
        assert(sorted, 'Default sort is by newest (createdOn descending)');
    } else {
        assert(true, 'Default sort is by newest (createdOn descending) - only one bug');
    }

    // Test 15: Pagination - pageSize
    console.log('\nTest 15: Pagination - pageSize');
    const pageSizeResponse = await authenticatedFetch(`${BASE_URL}/bugs?pageSize=3`);
    assert(pageSizeResponse.ok, 'pageSize parameter works');
    const pageSizeBugs = await pageSizeResponse.json();
    assertArrayLength(pageSizeBugs, 3, 'pageSize limits results correctly');

    // Test 16: Pagination - pageNumber
    console.log('\nTest 16: Pagination - pageNumber');
    const page1Response = await authenticatedFetch(`${BASE_URL}/bugs?pageSize=2&pageNumber=1`);
    const page2Response = await authenticatedFetch(`${BASE_URL}/bugs?pageSize=2&pageNumber=2`);
    assert(page1Response.ok && page2Response.ok, 'pageNumber parameter works');
    const page1Bugs = await page1Response.json();
    const page2Bugs = await page2Response.json();
    if (page1Bugs.length > 0 && page2Bugs.length > 0) {
        assert(page1Bugs[0]._id !== page2Bugs[0]._id, 'Different pages return different results');
    }

    // Test 17: Combined filters
    console.log('\nTest 17: Combined filters (keywords + classification + closed + sort)');
    const combinedResponse = await authenticatedFetch(`${BASE_URL}/bugs?keywords=bug&classification=bug&closed=false&sortBy=title&pageSize=5`);
    assert(combinedResponse.ok, 'Combined filters work');
    const combinedBugs = await combinedResponse.json();
    assert(Array.isArray(combinedBugs), 'Combined filters return array');
    assert(combinedBugs.length <= 5, 'Combined filters respect pageSize (results <= pageSize)');
}

// Main test runner
async function runTests() {
    // Initialize fetch
    if (typeof globalThis.fetch === 'function') {
        // Use native fetch (Node 18+)
        fetch = globalThis.fetch;
    } else {
        // Try to load node-fetch as fallback
        try {
            const nodeFetchModule = await import('node-fetch');
            fetch = nodeFetchModule.default || nodeFetchModule;
        } catch (e) {
            console.error('❌ Fetch is not available. Please use Node.js 18+ or install node-fetch:');
            console.error('   npm install node-fetch');
            process.exit(1);
        }
    }

    console.log('='.repeat(60));
    console.log('LAB 03-04: SEARCH ENDPOINTS TEST SUITE');
    console.log('='.repeat(60));

    try {
        await setup();
        await testUserEndpoint();
        await testBugEndpoint();

        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Tests Passed: ${testsPassed}`);
        console.log(`❌ Tests Failed: ${testsFailed}`);
        console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));

        if (testsFailed === 0) {
            console.log('\n🎉 All tests passed!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tests failed. Please review the output above.');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Test suite failed with error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
runTests();

