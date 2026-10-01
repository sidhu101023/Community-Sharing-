# ShareHub and Discrete Mathematics

ShareHub's data model makes the project's discrete mathematics visible in the working application.

## Sets and subsets

The `User` collection is the set of users and `Resource` is the set of resources. Resource categories are named sets such as Books and Sports. Available resources form a subset of all resources, represented by `availability: "Available"`.

## Relations

Ownership is a relation `Owns` contained in `Users x Resources`, represented by `Resource.owner`. A request is the relation `Requests`, represented by `Transaction.requester` and `Transaction.resource`.

## Functions and distance

The recommendation endpoint is a deterministic function `f(user) -> resources`. The Haversine helper is `d(user, resource) -> distanceKm`, using stored latitude and longitude. For example, a user in Kothrud can receive a calculator in Baner with a calculated distance rather than a string-location comparison.

## Graphs and weighted graphs

Users are vertices in `G = (V, E)`. A completed transaction creates a successful sharing relationship between owner and requester; its natural edge weight is their geographical distance. The application stores the two endpoints in `Transaction` and can derive the edge from completed records.

## Predicate logic

The request and recommendation rules implement predicates such as `Owns(u,r)`, `Available(r)`, and `Near(u,r)`. A recommendation must be available, belong to another user, and have coordinates; search additionally requires the resource to satisfy the keyword/category/distance predicates.

## Recommendations and transactions

Recommendations prioritize categories the user previously requested, then proximity and recency. Transactions create the user-to-resource request relation, and approved transaction responses expose contact details only to the two participating users. The owner/requester authorization checks enforce the relation boundaries.

## End-to-end transaction state machine

For users `u` and resource `r`, `Owns(u,r)` is true when `r.owner = u`. A request document represents `Requests(u,r)` through `requester = u` and `resource = r`. Approval creates the active sharing relation `Shares(u_owner, u_requester, r)` while the resource is unavailable.

The backend enforces this finite state machine:

```text
Pending -> Approved -> Completed
Pending -> Rejected
Pending -> Cancelled
```

`Approved` is a valid state only while the resource is unavailable. Completion is a conjunction predicate: `Completed(t)` is set only when `ownerCompleted(t) AND requesterCompleted(t)` are both true. The resource then returns to the Available subset.

Authorization is predicate logic over the authenticated identity: only `Owner(t)` can approve or reject, only `Requester(t)` can cancel, and only `Owner(t) OR Requester(t)` can complete or view approved contact fields. The active endpoint additionally intersects approved transactions with the current user's participant relation, so unrelated users cannot observe the edge or its private labels.

The transaction collection is therefore a graph edge record between two user vertices and one resource vertex. Its timestamps and completion flags provide the state-machine history, while the owner/requester/resource references preserve the underlying relations in MongoDB.
