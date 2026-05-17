import swaggerUi from "swagger-ui-express";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Concert Booking API",
    version: "1.0.0",
    description: "API documentation for the concert booking backend",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Bookings" },
    { name: "Concerts" },
    { name: "Admin Concerts" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server is healthy",
          },
        },
      },
    },
    "/api/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create booking",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateBookingRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Booking created successfully",
          },
        },
      },
    },
    "/api/bookings/code/{bookingCode}": {
      get: {
        tags: ["Bookings"],
        summary: "Get booking by code",
        parameters: [
          {
            name: "bookingCode",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Booking fetched successfully",
          },
        },
      },
    },
    "/api/bookings/me": {
      get: {
        tags: ["Bookings"],
        summary: "Get my bookings",
        parameters: [
          {
            name: "customerEmail",
            in: "query",
            required: false,
            schema: { type: "string", format: "email" },
            description: "Fallback when auth middleware is not present",
          },
        ],
        responses: {
          200: {
            description: "Bookings fetched successfully",
          },
        },
      },
    },
    "/api/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Get booking by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Booking fetched successfully",
          },
        },
      },
    },
    "/api/bookings/cancel/{id}": {
      post: {
        tags: ["Bookings"],
        summary: "Cancel booking",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Booking cancelled successfully",
          },
        },
      },
    },
    "/api/concerts": {
      get: {
        tags: ["Concerts"],
        summary: "Get all concerts",
        responses: {
          200: {
            description: "Concerts fetched successfully",
          },
        },
      },
    },
    "/api/concerts/{id}": {
      get: {
        tags: ["Concerts"],
        summary: "Get concert by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Concert fetched successfully",
          },
        },
      },
    },
    "/api/concerts/{id}/ticket-categories": {
      get: {
        tags: ["Concerts"],
        summary: "Get ticket categories by concert id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Ticket categories fetched successfully",
          },
        },
      },
    },
    "/api/admin/concerts": {
      post: {
        tags: ["Admin Concerts"],
        summary: "Create concert",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateConcertRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Concert created successfully",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateBookingRequest: {
        type: "object",
        required: ["customerEmail", "concertId", "idempotencyKey", "items"],
        properties: {
          customerEmail: { type: "string", format: "email" },
          customerName: { type: "string" },
          customerPhone: { type: "string" },
          concertId: { type: "string" },
          voucherCode: { type: "string" },
          idempotencyKey: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["ticketCategoryId", "quantity"],
              properties: {
                ticketCategoryId: { type: "string" },
                quantity: { type: "integer" },
              },
            },
          },
        },
      },
      CreateConcertRequest: {
        type: "object",
        required: ["name", "venue", "startTime", "status"],
        properties: {
          name: { type: "string" },
          venue: { type: "string" },
          startTime: { type: "string", format: "date-time" },
          status: { type: "string" },
          ticketCategories: {
            type: "array",
            items: {
              type: "object",
              required: [
                "name",
                "price",
                "totalQuantity",
                "availableQuantity",
              ],
              properties: {
                name: { type: "string" },
                price: { type: "number" },
                totalQuantity: { type: "integer" },
                availableQuantity: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(openApiSpec);
