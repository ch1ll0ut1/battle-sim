import { PoolItem } from 'pixi.js';

/**
 * # Object Pooling with BigPool
 *
 * Object pooling is a performance optimization technique that reuses objects instead of creating and destroying them repeatedly.
 * This is especially useful for objects that are expensive to construct or are frequently created and discarded (e.g., UI screens, game entities, effects).
 *
 * ## How to Use Pooling
 *
 * 1. **Implement the Poolable Interface:**
 *    - Any class you want to pool must implement the `Poolable<T>` interface (which extends `PoolItem`).
 *    - You must provide an `init(data: T)` method to reinitialize the object when it is reused from the pool.
 *    - You must provide a `reset()` method to clean up the object before it is returned to the pool.
 *
 * 2. **Getting an Instance from the Pool:**
 *    - Use `BigPool.get(Constructor, data)` to obtain an instance from the pool (or create a new one if none are available).
 *    - The second argument (`data`) is automatically passed as the first and only argument to the object's `init` method.
 *    - Example:
 *      ```ts
 *      const obj = BigPool.get(MyPoolableClass, someData); // someData is passed to obj.init(someData)
 *      // No need to call init manually; BigPool does this for you.
 *      ```
 *
 * 3. **Returning an Instance to the Pool:**
 *    - When done with the object, return it to the pool using `BigPool.return(instance)`.
 *    - BigPool will automatically call the object's `reset()` method before pooling it.
 *    - Example:
 *      ```ts
 *      BigPool.return(obj); // obj.reset() is called automatically
 *      ```
 *
 * 4. **Why Use Pooling?**
 *    - Pooling avoids frequent allocations and deallocations, reducing garbage collection and improving performance.
 *    - Ensures objects are properly reset and reinitialized between uses.
 *    - Particularly beneficial for objects that are shown/hidden or created/destroyed often.
 *
 * ## Requirements
 * - Classes to be pooled must implement `Poolable<T>`, which extends `PoolItem`.
 * - Implement the `init(data: T)` method for reinitialization logic.
 * - Implement the `reset()` method for cleanup logic.
 *
 */
export interface Poolable<T = undefined> extends PoolItem {
    init?(data: T): void;
    reset?(): void;
}
