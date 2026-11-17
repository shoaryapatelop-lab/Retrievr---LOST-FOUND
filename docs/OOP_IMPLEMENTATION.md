# OOP Implementation in Retrievr

## 1. Encapsulation
Private fields with Lombok @Getter/@Setter. Entities hide state; access via getters/setters. Example User entity: private fields email, password, role; public getters. Password never exposed in DTOs via mappers.

## 2. Inheritance
BaseEntity (@MappedSuperclass) -> User (abstract) -> Student, Admin. Item (abstract) -> LostItem, FoundItem. BaseEntity fields id/createdAt/updatedAt inherited. @SuperBuilder on User hierarchy.

## 3. Polymorphism
Compile-time: JwtService.generateToken overloads; mapper toResponseList overloads across mappers. Runtime: UserDetails methods overridden in User; @Override in service impls; Spring injects impl by interface.

## 4. Abstraction
Service interfaces define WHAT; impls define HOW. Repositories are interfaces. MatchingStrategy interface (unused/dead code).

## 5. Other concepts
Constructors: Lombok @RequiredArgsConstructor, @NoArgsConstructor, @SuperBuilder. Static/final: FileStorageServiceImpl ALLOWED_CONTENT_TYPES etc. Composition: Item has Category, reporter. DI via constructor injection.

## 6. SOLID
SRP: controllers handle HTTP, services business logic, repos data. OCP: strategy interface (unused). LSP: Student/Admin substitutable for User. ISP: separate service interfaces. DIP: controllers depend on interfaces.

## 7. Gaps
MatchingStrategy dead code. Complaint entity orphaned. CreateItemRequest/ItemDetailResponse empty. ItemStatus.ARCHIVED never assigned. Claim advanced statuses never set. findMatches duplicated.
