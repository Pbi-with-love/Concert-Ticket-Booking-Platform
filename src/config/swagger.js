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
    { name: "Payments" },
    { name: "Concerts" },
    { name: "Admin Concerts" },
    { name: "Admin Ticket Categories" },
    { name: "Admin Bookings" },
    { name: "Admin Attendees" },
    { name: "Admin Vouchers" },
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
    "/api/payments/url": {
      post: {
        tags: ["Payments"],
        summary: "Create payment URL",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreatePaymentUrlRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Payment URL created successfully",
          },
        },
      },
    },
    "/api/payments/{id}/mock-success": {
      post: {
        tags: ["Payments"],
        summary: "Mock payment success",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Payment id",
          },
        ],
        responses: {
          200: {
            description: "Payment marked as successful",
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
    "/api/admin/concerts/{id}": {
      patch: {
        tags: ["Admin Concerts"],
        summary: "Update concert",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateConcertRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Concert updated successfully",
          },
        },
      },
      delete: {
        tags: ["Admin Concerts"],
        summary: "Delete concert",
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
            description: "Concert deleted successfully",
          },
        },
      },
    },
    "/api/admin/bookings": {
      get: {
        tags: ["Admin Bookings"],
        summary: "Get all bookings",
        parameters: [
          {
            name: "concertId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter bookings by concert id",
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"],
            },
            description: "Filter bookings by status",
          },
          {
            name: "customerEmail",
            in: "query",
            required: false,
            schema: { type: "string", format: "email" },
            description: "Filter bookings by customer email",
          },
        ],
        responses: {
          200: {
            description: "Bookings fetched successfully",
          },
        },
      },
    },
    "/api/admin/bookings/{id}": {
      get: {
        tags: ["Admin Bookings"],
        summary: "Get booking by id as admin",
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
      patch: {
        tags: ["Admin Bookings"],
        summary: "Update booking customer info",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateBookingCustomerInfoRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Booking customer info updated successfully",
          },
        },
      },
    },
    "/api/admin/bookings/{id}/status": {
      patch: {
        tags: ["Admin Bookings"],
        summary: "Update booking status as admin",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateBookingStatusRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Booking status updated successfully",
          },
        },
      },
    },
    "/api/admin/bookings/cancel/{id}": {
      post: {
        tags: ["Admin Bookings"],
        summary: "Cancel booking as admin",
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
    "/api/admin/attendees": {
      get: {
        tags: ["Admin Attendees"],
        summary: "Get attendees by booking id",
        parameters: [
          {
            name: "bookingId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Attendees fetched successfully",
          },
        },
      },
    },
    "/api/admin/attendees/ticket/{ticketCode}": {
      get: {
        tags: ["Admin Attendees"],
        summary: "Get attendee by ticket code",
        parameters: [
          {
            name: "ticketCode",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Attendees fetched successfully",
          },
        },
      },
    },
    "/api/admin/attendees/check-in": {
      post: {
        tags: ["Admin Attendees"],
        summary: "Check in attendee by ticket code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CheckInAttendeeRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Attendee checked in successfully",
          },
        },
      },
    },
    "/api/admin/ticket-categories": {
      get: {
        tags: ["Admin Ticket Categories"],
        summary: "Get all ticket categories",
        parameters: [
          {
            name: "concertId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter ticket categories by concert id",
          },
        ],
        responses: {
          200: {
            description: "Ticket categories fetched successfully",
          },
        },
      },
      post: {
        tags: ["Admin Ticket Categories"],
        summary: "Create ticket category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateTicketCategoryRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Ticket category created successfully",
          },
        }
      },
    },
    "/api/admin/ticket-categories/{id}": {
      get: {
        tags: ["Admin Ticket Categories"],
        summary: "Get ticket category by id",
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
            description: "Ticket category fetched successfully",
          },
        },
      },
      patch: {
        tags: ["Admin Ticket Categories"],
        summary: "Update ticket category",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateTicketCategoryRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ticket category updated successfully",
          },
        },
      },
      delete: {
        tags: ["Admin Ticket Categories"],
        summary: "Delete ticket category",
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
            description: "Ticket category deleted successfully",
          },
        },
      },
    },
    "/api/admin/vouchers": {
      get: {
        tags: ["Admin Vouchers"],
        summary: "Get all vouchers",
        responses: {
          200: {
            description: "Vouchers fetched successfully",
          },
        },
      },
      post: {
        tags: ["Admin Vouchers"],
        summary: "Create voucher",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateVoucherRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Voucher created successfully",
          },
        },
      },
    },
    "/api/admin/vouchers/{id}": {
      get: {
        tags: ["Admin Vouchers"],
        summary: "Get voucher by id",
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
            description: "Voucher fetched successfully",
          },
        },
      },
      patch: {
        tags: ["Admin Vouchers"],
        summary: "Update voucher",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateVoucherRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Voucher updated successfully",
          },
        },
      },
      delete: {
        tags: ["Admin Vouchers"],
        summary: "Delete voucher",
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
            description: "Voucher deleted successfully",
          },
        },
      },
    },
    "/api/admin/vouchers/deactivate/{id}": {
      patch: {
        tags: ["Admin Vouchers"],
        summary: "Deactivate voucher",
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
            description: "Voucher deactivated successfully",
          },
        },
      },
    },
    "/api/admin/vouchers/activate/{id}": {
      patch: {
        tags: ["Admin Vouchers"],
        summary: "Activate voucher",
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
            description: "Voucher activated successfully",
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
      UpdateBookingStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"],
          },
        },
      },
      UpdateBookingCustomerInfoRequest: {
        type: "object",
        properties: {
          customerName: { type: "string" },
          customerPhone: { type: "string" },
          customerEmail: { type: "string", format: "email" },
        },
      },
      UpdateConcertRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          venue: { type: "string" },
          startTime: { type: "string", format: "date-time" },
          status: { type: "string" },
        },
      },
      CreatePaymentUrlRequest: {
        type: "object",
        required: ["bookingId"],
        properties: {
          bookingId: { type: "string" },
        },
      },
      CreateTicketCategoryRequest: {
        type: "object",
        required: [
          "concertId",
          "name",
          "price",
          "totalQuantity",
          "availableQuantity",
        ],
        properties: {
          concertId: { type: "string" },
          name: { type: "string" },
          price: { type: "number" },
          totalQuantity: { type: "integer" },
          availableQuantity: { type: "integer" },
        },
      },
      UpdateTicketCategoryRequest: {
        type: "object",
        properties: {
          concertId: { type: "string" },
          name: { type: "string" },
          price: { type: "number" },
          totalQuantity: { type: "integer" },
          availableQuantity: { type: "integer" },
        },
      },
      CheckInAttendeeRequest: {
        type: "object",
        required: ["ticketCode"],
        properties: {
          ticketCode: { type: "string" },
        },
      },
      CreateVoucherRequest: {
        type: "object",
        required: [
          "code",
          "discountType",
          "discountValue",
          "maxUsage",
          "startDate",
          "endDate",
        ],
        properties: {
          code: { type: "string" },
          discountType: {
            type: "string",
            enum: ["PERCENTAGE", "FIXED"],
          },
          discountValue: { type: "number" },
          maxUsage: { type: "integer" },
          usedCount: { type: "integer", default: 0 },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          isActive: { type: "boolean", default: true },
        },
      },
      UpdateVoucherRequest: {
        type: "object",
        properties: {
          code: { type: "string" },
          discountType: {
            type: "string",
            enum: ["PERCENTAGE", "FIXED"],
          },
          discountValue: { type: "number" },
          maxUsage: { type: "integer" },
          usedCount: { type: "integer" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          isActive: { type: "boolean" },
        },
      },
    },
  },
};

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(openApiSpec);
