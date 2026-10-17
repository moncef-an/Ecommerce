import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const BASE_URL = "http://localhost:3030";

const failedRequests = new Rate("failed_requests");
const serverErrors = new Rate("server_errors");

const CATEGORIES = [
    "PC",
    "Laptop",
    "Keyboard",
    "Phones",
    "Mouses",
];

export const options = {
    stages: [
        { duration: "15s", target: 50 },
        { duration: "15s", target: 100 },
        { duration: "20s", target: 250 },
        { duration: "20s", target: 500 },
        { duration: "20s", target: 750 },
        { duration: "30s", target: 1000 },
        { duration: "60s", target: 1000 },
        { duration: "30s", target: 0 },
    ],

    thresholds: {
        failed_requests: ["rate<0.05"],
        server_errors: ["rate<0.01"],

        "http_req_duration{endpoint:POST /products}": [
            "p(95)<2000",
        ],

        "http_req_duration{endpoint:GET /products}": [
            "p(95)<1000",
        ],

        "http_req_duration{endpoint:GET /categories}": [
            "p(95)<1000",
        ],

        "http_req_duration{endpoint:POST /cart/items}": [
            "p(95)<2000",
        ],

        "http_req_duration{endpoint:GET /cart}": [
            "p(95)<1500",
        ],

        "http_req_duration{endpoint:DELETE /cart}": [
            "p(95)<1500",
        ],
    },
};

function recordResult(res) {
    failedRequests.add(res.status >= 400);
    serverErrors.add(res.status >= 500);
}

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

function login(email, password) {
    const payload = JSON.stringify({
        email: email,
        password: password,
    });

    const res = http.post(
        `${BASE_URL}/api/v1/auth/login`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    recordResult(res);

    if (res.status !== 200) {
        console.log(
            `[VU ${__VU}] Login failed: ${res.status} ${res.body}`
        );
        return null;
    }

    let data;

    try {
        data = res.json();
    } catch (e) {
        console.log(`[VU ${__VU}] Invalid login JSON`);
        return null;
    }

    return data.accesstoken;
}

// --------------------------------------------------
// CREATE PRODUCT
// --------------------------------------------------

function createProduct(token, category, productNumber) {
    const product = {
        name: `K6 ${category} Product ${__VU}-${productNumber}`,

        description:
            `Stress test product for category ${category}`,

        price: Math.floor(Math.random() * 900) + 100,

        stock: 1000000,

        category: category,
    };

    const res = http.post(
        `${BASE_URL}/api/v1/products`,
        JSON.stringify(product),
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },

            tags: {
                endpoint: "POST /products",
            },
        }
    );

    recordResult(res);

    const success = check(res, {
        "product created": r =>
            r.status === 200 || r.status === 201,
    });

    if (!success) {
        console.log(
            `[VU ${__VU}] Product creation failed: ${res.status} ${res.body}`
        );
    }

    return success;
}

// --------------------------------------------------
// REGISTER USER
// --------------------------------------------------

function registerUser(email, password) {
    const payload = JSON.stringify({
        email: email,
        password: password,
        name: `K6 User ${__VU}`,
    });

    const res = http.post(
        `${BASE_URL}/api/v1/auth/register`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    // 409 is acceptable if the user already exists.
    failedRequests.add(
        res.status >= 400 && res.status !== 409
    );

    serverErrors.add(res.status >= 500);

    if (
        res.status !== 200 &&
        res.status !== 201 &&
        res.status !== 409
    ) {
        console.log(
            `[VU ${__VU}] Register failed: ${res.status} ${res.body}`
        );

        return false;
    }

    return true;
}

// --------------------------------------------------
// USER TOKEN
// --------------------------------------------------

function getUserToken() {
    const email = `k6_user_${__VU}@test.com`;
    const password = "Password123!";

    registerUser(email, password);

    return login(email, password);
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------

export function setup() {
    console.log("==============================================");
    console.log("K6 E-COMMERCE STRESS TEST");
    console.log("==============================================");

    const sellerEmail = __ENV.EMAIL;
    const sellerPassword = __ENV.PASSWORD;

    if (!sellerEmail || !sellerPassword) {
        throw new Error(
            "EMAIL and PASSWORD environment variables are required"
        );
    }

    const sellerToken = login(
        sellerEmail,
        sellerPassword
    );

    if (!sellerToken) {
        throw new Error(
            "Seller login failed. Cannot continue."
        );
    }

    console.log("[SETUP] Seller login successful");

    return {
        sellerToken: sellerToken,
    };
}

// --------------------------------------------------
// MAIN TEST
// --------------------------------------------------

export default function (data) {
    // ----------------------------------------------
    // 1. SELLER CREATES PRODUCTS
    // ----------------------------------------------

    // Each VU creates products in different categories.
    const category = CATEGORIES[
        (__VU - 1) % CATEGORIES.length
    ];

    const productNumber =
        ((__ITER % 5) + 1);

    createProduct(
        data.sellerToken,
        category,
        productNumber
    );

    sleep(0.2);

    // ----------------------------------------------
    // 2. USER LOGIN
    // ----------------------------------------------

    const userToken = getUserToken();

    if (!userToken) {
        sleep(1);
        return;
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`,
    };

    // ----------------------------------------------
    // 3. BROWSE PRODUCTS
    // ----------------------------------------------

    if (Math.random() < 0.8) {
        const productsRes = http.get(
            `${BASE_URL}/api/v1/products`,
            {
                headers: headers,
                tags: {
                    endpoint: "GET /products",
                },
            }
        );

        recordResult(productsRes);

        check(productsRes, {
            "GET products 200":
                r => r.status === 200,
        });

        sleep(0.2);

        // Categories GET is public.
        const categoriesRes = http.get(
            `${BASE_URL}/api/v1/categories`,
            {
                tags: {
                    endpoint: "GET /categories",
                },
            }
        );

        recordResult(categoriesRes);

        check(categoriesRes, {
            "GET categories 200":
                r => r.status === 200,
        });

        sleep(0.2);

        return;
    }

    // ----------------------------------------------
    // 4. CART
    // ----------------------------------------------

    /*
       We first get products so that the test can
       obtain an actual product ID from the database.
    */

    const productsRes = http.get(
        `${BASE_URL}/api/v1/products`,
        {
            headers: headers,
            tags: {
                endpoint: "GET /products",
            },
        }
    );

    recordResult(productsRes);

    if (productsRes.status !== 200) {
        sleep(0.5);
        return;
    }

    let products;

    try {
        products = productsRes.json();
    } catch (e) {
        console.log(
            `[VU ${__VU}] Invalid products response`
        );

        sleep(0.5);
        return;
    }

    /*
       Supports either:

       [
           {...}
       ]

       or:

       {
           "products": [...]
       }

       or:

       {
           "data": [...]
       }
    */

    if (Array.isArray(products)) {
        // already correct
    } else if (Array.isArray(products.products)) {
        products = products.products;
    } else if (Array.isArray(products.data)) {
        products = products.data;
    } else {
        console.log(
            `[VU ${__VU}] Could not find products array`
        );

        sleep(0.5);
        return;
    }

    if (products.length === 0) {
        sleep(0.5);
        return;
    }

    const product =
        products[
            Math.floor(
                Math.random() * products.length
            )
        ];

    const productID =
        product.id || product.ID;

    if (!productID) {
        console.log(
            `[VU ${__VU}] Product has no ID`
        );

        sleep(0.5);
        return;
    }

    // ----------------------------------------------
    // 5. ADD TO CART
    // ----------------------------------------------

    const addToCartPayload = JSON.stringify({
        product_id: productID,
        quantity: 1,
    });

    const addRes = http.post(
        `${BASE_URL}/api/v1/cart/items`,
        addToCartPayload,
        {
            headers: headers,

            tags: {
                endpoint: "POST /cart/items",
            },
        }
    );

    recordResult(addRes);

    check(addRes, {
        "POST cart item successful":
            r => r.status === 200 || r.status === 201,
    });

    sleep(0.2);

    // ----------------------------------------------
    // 6. GET CART
    // ----------------------------------------------

    const cartRes = http.get(
        `${BASE_URL}/api/v1/cart`,
        {
            headers: headers,

            tags: {
                endpoint: "GET /cart",
            },
        }
    );

    recordResult(cartRes);

    check(cartRes, {
        "GET cart 200":
            r => r.status === 200,
    });

    sleep(0.2);

    // ----------------------------------------------
    // 7. CLEAR CART
    // ----------------------------------------------

    const deleteRes = http.del(
        `${BASE_URL}/api/v1/cart`,
        null,
        {
            headers: headers,

            tags: {
                endpoint: "DELETE /cart",
            },
        }
    );

    recordResult(deleteRes);

    check(deleteRes, {
        "DELETE cart successful":
            r => r.status === 200 ||
                 r.status === 204,
    });

    sleep(0.2);
}

// --------------------------------------------------
// SUMMARY
// --------------------------------------------------

export function handleSummary(data) {
    const failed =
        data.metrics.failed_requests
            ? data.metrics.failed_requests.values.rate * 100
            : 0;

    const serverErrors =
        data.metrics.server_errors
            ? data.metrics.server_errors.values.rate * 100
            : 0;

    console.log("");
    console.log("==============================================");
    console.log("K6 STRESS TEST SUMMARY");
    console.log("==============================================");

    console.log(
        `Total requests: ${
            data.metrics.http_reqs.values.count
        }`
    );

    console.log(
        `Failed requests: ${failed.toFixed(2)}%`
    );

    console.log(
        `Server errors (5xx): ${serverErrors.toFixed(2)}%`
    );

    if (data.metrics.checks) {
        console.log(
            `Checks: ${
                (
                    data.metrics.checks.values.rate * 100
                ).toFixed(2)
            }%`
        );
    }

    console.log("==============================================");

    return {};
}

