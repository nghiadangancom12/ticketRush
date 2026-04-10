# 🏗️ Repository Pattern Implementation

## ✅ Architecture: 3-Layer Separation of Concerns

### Layer Diagram
```
┌─────────────────────────────────────┐
│       Controller (Mỏng)              │
│   - Điều phối request/response       │
│   - Gọi Service                      │
│   - Không có logic nghiệp vụ         │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      Service (Logic)                 │
│   - Xử lý business logic             │
│   - Gọi Repository                   │
│   - Tuyệt đối KHÔNG import Prisma     │
│   - Xử lý validation, transformation  │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│     Repository (Data Access)        │
│   - Tương tác CHỈ với Prisma        │
│   - Các method query đơn giản        │
│   - Không chứa logic nghiệp vụ      │
└─────────────────────────────────────┘
```

---

## 📁 File Structure - All Modules

### Auth Module ✅
```
modules/auth/
├── authRepository.js    (Repository)
│   ├── findByEmail(email)
│   ├── create(userData)
│   └── findById(id)
│
├── authService.js       (Service - NO Prisma!)
│   ├── register(data)   → calls authRepository
│   └── login(data)      → calls authRepository
│
├── authController.js    (Controller - Mỏng)
│   ├── register()       → calls authService
│   └── login()          → calls authService
│
├── authRoutes.js        (Routes)
└── auth.middleware.js   (Middleware)
```

### Users Module ✅
```
modules/users/
├── userRepository.js    (Repository)
│   ├── findById(id)
│   ├── create(data)
│   ├── update(id, data)
│   └── findMany(where)
│
├── userService.js       (Service - NO Prisma!)
│   ├── getProfile(userId)
│   └── updateProfile(userId, data)
│
├── usersController.js   (Controller - Mỏng)
│   ├── getProfile()
│   └── updateProfile()
│
└── usersRoutes.js       (Routes)
```

### Customers Module ✅
```
modules/customers/
├── customerRepository.js (Repository)
│   ├── findById(id)
│   ├── update(id, data)
│   ├── getOrderHistory(userId)
│   └── getLockedSeats(userId)
│
├── customerService.js   (Service - NO Prisma!)
│   ├── getProfile(userId)
│   ├── updateProfile(userId, data)
│   ├── getOrderHistory(userId)
│   └── getLockedSeats(userId)
│
├── customerController.js (Controller - Mỏng)
│   ├── getMe()
│   └── updateMe()
│
└── customerRoutes.js    (Routes)
```

### Admin Module ✅
```
modules/admin/
├── adminRepository.js   (Repository)
│   ├── getGenderStats()
│   ├── getTopSpenders(limit)
│   ├── getUserById(id)
│   └── getDashboardStats()
│
├── adminService.js      (Service - NO Prisma!)
│   ├── getProfile(userId)
│   ├── getCustomerAnalytics()
│   └── getDashboardStats()
│
├── adminController.js   (Controller - Mỏng)
│   ├── getDashboard()
│   └── getCustomerAnalytics()
│
└── adminRoutes.js       (Routes)
```

### Events Module ✅
```
modules/events/
├── eventRepository.js   (Repository)
│   ├── findAllPublished()
│   ├── findById(id)
│   ├── create(eventData)
│   ├── createZone(zoneData)
│   └── createManySeats(seatsData)
│
├── eventService.js      (Service - NO Prisma!)
│   ├── getAllPublished()
│   ├── getById(id)
│   └── create(data)
│
├── eventController.js   (Controller - Mỏng)
│   ├── getAll()
│   ├── getOne()
│   └── create()
│
└── eventRoutes.js       (Routes)
```

### Seats Module ✅
```
modules/seats/
├── seatRepository.js    (Repository)
│   ├── countUserSeatsInEvent(userId, eventId)
│   ├── getSeatsForUpdate(seatIds)
│   ├── updateSeatsToLocked(seatIds, userId, time)
│   ├── getLockedSeatsForCheckout(userId, eventId)
│   ├── createOrder(userId, amount)
│   ├── createTicket(orderId, seatId, qrCode)
│   └── updateSeatsToSold(seatIds)
│
├── seatService.js       (Service - NO Prisma!)
│   ├── holdSeats(userId, eventId, seatIds)
│   └── checkout(userId, eventId)
│
├── BookingFacade.js     (Transaction Façade - handles transactions)
│   ├── holdSeats()      → prisma.$transaction
│   └── checkout()       → prisma.$transaction
│
├── seatController.js    (Controller - Mỏng)
│   ├── holdSeats()
│   └── checkout()
│
└── seatRoutes.js        (Routes)
```

---

## 🔄 Data Flow Example: Update Profile

### Request Flow
```
1. Browser
   POST /api/customers/me
   { full_name, avatar_url, gender }
   + Authorization header

2. customersRouter
   → customersController.updateMe()

3. customersController (Điều phối)
   - Extract userId from request
   - Call customerService.updateProfile()
   - Return ResponseFactory.success()

4. customerService (Logic)
   - Validate input
   - Build updateData object
   - Call customerRepository.update()
   - Remove password from response
   - Return safe user object

5. customerRepository (Data)
   - Call prisma.users.update()
   - Return database result

6. Response → Browser
   ✅ { updated_user_data }
```

### Code Example

**Controller (Request/Response)**:
```javascript
exports.updateMe = catchAsync(async (req, res) => {
  // Thin - mỏng, chỉ điều phối
  const updated = await customerService.updateProfile(req.userId, req.body);
  ResponseFactory.success(res, updated, 'Profile updated successfully');
});
```

**Service (Logic)**:
```javascript
async updateProfile(userId, { full_name, date_of_birth, gender, avatar_url }) {
  // Business logic - validate, transform
  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (date_of_birth !== undefined) updateData.date_of_birth = new Date(date_of_birth) : null;
  if (gender !== undefined) updateData.gender = gender;
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

  // Call repository (NO Prisma here!)
  const updated = await customerRepository.update(userId, updateData);

  // Filter sensitive data
  const { password, ...safeUser } = updated;
  return safeUser;
}
```

**Repository (Data Access)**:
```javascript
async update(id, data) {
  // Pure database operation
  return prisma.users.update({
    where: { id },
    data
  });
}
```

---

## ✅ Separation Rules Applied

### Repository Level ✅
```
✅ Only imports Prisma
✅ Pure database queries
✅ No business logic
✅ Method names reflect DB operations
❌ No service imports
❌ No validation logic
❌ No transformation logic
```

**Example**:
```javascript
async update(id, data) {
  return prisma.users.update({ where: { id }, data });
}
```

### Service Level ✅
```
✅ Imports Repository only
✅ Business logic
✅ Validation & transformation
✅ Multiple repository calls okay
❌ NEVER import Prisma directly
❌ No request/response handling
❌ No pure SQL queries
```

**Example**:
```javascript
async updateProfile(userId, data) {
  // Validate
  if (!data.email) throw new Error('Missing email');
  
  // Transform
  const updateData = { email: data.email.toLowerCase() };
  
  // Call repository (not Prisma!)
  return await customerRepository.update(userId, updateData);
}
```

### Controller Level ✅
```
✅ Request/response handling
✅ Calls service methods
✅ Error handling via catchAsync
✅ Output formatting via ResponseFactory
❌ NO business logic
❌ NO database queries
❌ NO imports of Prisma or Repository
```

**Example**:
```javascript
exports.updateProfile = catchAsync(async (req, res) => {
  const updated = await customerService.updateProfile(req.userId, req.body);
  ResponseFactory.success(res, updated, 'Updated');
});
```

---

## 🔐 Imports Verification

### ✅ CORRECT Imports

**Repository**:
```javascript
const prisma = require('../../config/database');  // ✅ Only Prisma
```

**Service**:
```javascript
const userRepository = require('./userRepository');    // ✅ Only Repository
const AppError = require('../errorHandling/AppError');  // ✅ Error handling
// NO Prisma import!
```

**Controller**:
```javascript
const userService = require('./userService');        // ✅ Only Service
const ResponseFactory = require('../../utils/ResponseFactory'); // ✅ Response
const catchAsync = require('../errorHandling/catchAsync');      // ✅ Error wrapper
// NO Repository, NO Prisma!
```

---

## 🧪 Testing Benefits

### Unit Testing
```javascript
// Easy to mock!

// Mock repository
const mockRepository = {
  findByEmail: jest.fn().mockResolvedValue(null),
  create: jest.fn()
};

// Test service in isolation
const service = new AuthService(mockRepository);
await service.register(testData);
expect(mockRepository.create).toHaveBeenCalled();
```

### Integration Testing
```javascript
// Can test service with real repository
// Can test controller with mock service
```

---

## 📊 Module Dependencies

```
Controller
    ↓ (calls)
Service
    ↓ (calls)
Repository
    ↓ (calls)
Prisma + Database
```

**NOT**:
```
Controller → Repository (Direct call)    ❌
Service → Prisma (Direct call)            ❌
```

---

## 🎯 Benefits Summary

| Benefit | Before | After |
|---------|--------|-------|
| **Testability** | Hard (mixed concerns) | Easy (isolated layers) |
| **Maintainability** | Complex (logic scattered) | Clear (separated logic) |
| **Reusability** | Low (controllers mixed with data) | High (services reusable) |
| **Readability** | Confusing | Clear purpose per file |
| **Migration** | Hard (change DB = refactor everywhere) | Easy (change Repository only) |
| **Debugging** | Unclear where error is | Clear layer to check |
| **Team Scalability** | Slow (people step on each other) | Fast (clear boundaries) |

---

## 🚀 Quick Reference

### Adding New Feature

1. **Create Repository** (data access)
2. **Create Service** (business logic)
3. **Create Controller** (request handling)
4. **Create Routes** (URL mapping)

### Workflow
```
User Request
    ↓
Router → Controller (thin)
    ↓
Service (logic)
    ↓
Repository (data)
    ↓
Prisma
    ↓
Database
    ↓ (response bubbles up)
ResponseFactory
    ↓
User Response
```

---

## 📝 Code Review Checklist

When reviewing code, ensure:

- [ ] **Repository** - Only Prisma queries, no logic
- [ ] **Service** - NO Prisma imports, only Repository calls
- [ ] **Controller** - NO Repository/Prisma imports, calls Service only
- [ ] **Layer separation** - Each layer has single responsibility
- [ ] **Error handling** - Thrown from Service, caught in Controller
- [ ] **Data filtering** - Passwords removed in Service
- [ ] **Validation** - Done in Service, not Controller
- [ ] **Transactions** - In Repository or Façade if needed

---

## ✅ Status

**All Modules Refactored**: ✅
- Auth ✅
- Users ✅
- Customers ✅
- Admin ✅
- Events ✅
- Seats ✅

**Pattern Applied**: Repository Pattern (3-layer)
**Benefits**: Clean separation, testable, maintainable, scalable

---

**This is now production-ready code following enterprise patterns!** 🚀
