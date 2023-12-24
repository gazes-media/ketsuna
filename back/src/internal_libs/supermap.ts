const kDateCache = Symbol('supermap.date_cache');

class SuperMap<K, V> extends Map<K, V> {
    #options: RequiredPick<SuperMapOptions<K, V>, 'expireAfter' | 'itemsLimit'>;
    private [kDateCache]: Map<K, number> | null = null;
    #interval: NodeJS.Timeout | null = null;

    constructor(options: Partial<SuperMapOptions<K, V>> = {}) {
        if ('intervalTime' in options && (!Number.isSafeInteger(options.intervalTime) || options.intervalTime! < 0))
            throw new TypeError('options.intervalTime must be a safe positive integer.');
        if ('expireAfter' in options && (!Number.isSafeInteger(options.expireAfter) || options.expireAfter! < 0))
            throw new TypeError('options.expireAfter must be a safe positive integer.');
        if ('itemsLimit' in options && (!Number.isSafeInteger(options.itemsLimit) || options.itemsLimit! < 0))
            throw new TypeError('options.itemsLimit must be a safe positive integer.');
        if ('onSweep' in options && typeof options.onSweep !== 'function')
            throw new TypeError('options.onSweep must be a function.');

        options = {
            expireAfter: 0,
            itemsLimit: 0,
            ...options
        };

        super();
        this.#options = options as never;
        if ('intervalTime' in options) {
            this[kDateCache] = new Map();
            this.startInterval();
        }
    }

    /** Converts the Map to an array of entries. */
    public toArray() { return Array.from(this.entries()); }
    public delete(key: K) { return this[kDateCache]?.delete(key), super.delete(key); }

    /**
     * Identical to [Map.prototype.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set) but with a third argument.
     * @param ttl Time to live duration of this entry (in milliseconds).
     *  - It has no effect if `options.intervalTime` isn't provided.
     *  - `options.expireAfter` sums with `ttl`.
     */
    public set(key: K, value: V, ttl = 0) {
        if (!Number.isSafeInteger(ttl)) throw new TypeError('ttl must be a safe integer');

        const itemsLimit = this.#options.itemsLimit;
        if (itemsLimit > 0 && this.size >= itemsLimit && !this.has(key)) {
            this.delete(this.first(true)!);
        }

        this[kDateCache]?.set(key, Date.now() + ttl);
        return super.set(key, value);
    }

    /**
     * Identical to [Map.prototype.clear](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear) but with a second argument.
     * @param stopInterval If set to `true`, the sweeping interval is also stopped.
     */
    public clear(stopInterval = false) {
        if (stopInterval) this.stopInterval();
        else this[kDateCache]?.clear();
        return super.clear();
    }

    /**
     * Gets the first key or value of the Map.
     * @param key If set to `true`, it will return the first key instead of value.
     */
    public first(key?: false): V | undefined
    public first(key: true): K | undefined
    public first(key?: boolean): unknown {
        return key ? this.keys().next().value : this.values().next().value;
    }

    /**
     * Gets the last key or value of the Map. *This method should be avoided as it iterates the whole Map*.
     * @param key If set to `true`, it will return the last key instead of value.
     */
    public last(key?: false): V | undefined
    public last(key: true): K | undefined
    public last(key = false): unknown {
        const entries = this.entries();
        let lastEntry;

        while (true) {
            const iter = entries.next();
            if (iter.done) return lastEntry && lastEntry[key ? 0 : 1];

            lastEntry = iter.value;
        }
    }

    /** Identical to [Array.prototype.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) */
    public some(func: (value: V, key: K, self: this) => boolean) {
        const entries = this.entries();

        while (true) {
            const iter = entries.next();
            if (iter.done) return false;
            if (func(iter.value[1], iter.value[0], this)) return true;
        }
    }

    /** Identical to [Array.prototype.every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) */
    public every(func: (value: V, key: K, self: this) => boolean) {
        const entries = this.entries();

        while (true) {
            const iter = entries.next();
            if (iter.done) return true;
            if (!func(iter.value[1], iter.value[0], this)) return false;
        }
    }

    /** Deletes the entries that pass the `sweeper` callback and calls the `options.onSweep` callback (if provided). */
    public sweep(sweeper: (value: V, key: K, self: this) => boolean) {
        if (this.size === 0) return -1;

        const onSweep = this.#options.onSweep;
        const prev = this.size;

        super.forEach((v, k) => {
            if (sweeper(v, k, this as never)) {
                onSweep?.(v, k);
                this.delete(k);
            }
        });

        return prev - this.size;
    }

    /** Identical to [Array.prototype.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) */
    public filter(func: (value: V, key: K, self: this) => boolean) {
        const map = new SuperMap<K, V>(this.#options);
        const entries = this.entries();

        while (true) {
            const iter = entries.next();
            if (iter.done) return map;

            const [k, v] = iter.value;
            if (func(v, k, this)) map.set(k, v);
        }
    }

    /** 
     * Identical to [Array.prototype.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     * but this method also accepts a filter callback to filter the entries before mapping them without iterating the whole map again.
     * Prefer using this method instead of `<SuperMap>.filter(...).map(...)`.
     * @param filterFn Optional filter callback to filter entries.
     */
    public map<T>(
        mapFn: (value: V, key: K, self: this) => T,
        filterFn?: (value: V, key: K, self: this) => boolean
    ) { return Array.from(this.#mapGenerator(mapFn, filterFn)); }

    /**
     * Identical to [Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) but with a second argument.
     * @param returnKey If set to `true`, it will return the found key instead of value.
     */
    public find(func: (value: V, key: K, self: this) => boolean, returnKey: true): K | null
    public find(func: (value: V, key: K, self: this) => boolean, returnKey?: false): V | null
    public find(func: (value: V, key: K, self: this) => boolean, returnKey = false): K | V | null {
        const entries = this.entries();

        while (true) {
            const iter = entries.next();
            if (iter.done) return null;

            const [k, v] = iter.value;
            if (func(v, k, this)) return returnKey ? k : v;
        }
    }

    /** Identical to [Array.prototype.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) */
    public reduce<T>(fn: (accumulator: T | undefined, value: V, key: K, self: this) => T, initialValue?: T) {
        const entries = this.entries();
        var accumulator = initialValue;

        while (true) {
            const iter = entries.next();
            if (iter.done) return accumulator!;

            accumulator = fn(accumulator, iter.value[1], iter.value[0], this);
        }
    }

    /** Identical to [Array.prototype.concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat) */
    public concat(...children: ReadonlyArray<SuperMap<K, V>>) {
        const results = new SuperMap<K, V>(this.#options);
        results[kDateCache] = this[kDateCache];

        for (const child of children.concat(this)) {
            const entries = child.entries();

            while (true) {
                const iter = entries.next();
                if (iter.done) break;

                results.set(...iter.value);
            }
        }

        return results;
    }

    /** 
     * Identical to [Array.prototype.concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
     * but this method mutates this instance instead of creating a new one.
     */
    public concatMut(...children: ReadonlyArray<SuperMap<K, V>>) {
        for (const child of children) {
            const entries = child.entries();

            while (true) {
                const iter = entries.next();
                if (iter.done) break;

                this.set(...iter.value);
            }
        }

        return this;
    }

    /** Identical to [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort). */
    public sort(sortFn: (vA: V, vB: V, kA: K, kB: K, self: this) => number) {
        this.toArray()
            .sort(([kA, vA], [kB, vB]) => sortFn(vA, vB, kA, kB, this))
            .forEach((v) => this.set(...v));

        this.clear();
        return this;
    }

    /** Starts or restarts the sweeping interval. It gets automatically called in the constructor if the `intervalTime` option has been provided. */
    public startInterval() {
        if (this[kDateCache] === null || !('intervalTime' in this.#options)) {
            return false;
        }

        this.stopInterval();
        this.#interval = setInterval(() => this.#onSweep(), this.#options.intervalTime!).unref();

        return true;
    }

    /** Stops the sweeping interval. */
    public stopInterval() {
        if (this[kDateCache] === null) return false;
        this[kDateCache]!.clear();

        if (this.#interval !== null) {
            clearInterval(this.#interval);
            this.#interval = null;
        }

        return true;
    }

    #onSweep() {
        const entries = this.entries(), dEntries = this[kDateCache]!.entries();
        const time = Date.now() - this.#options.expireAfter;
        const onSweep = this.#options.onSweep;

        while (true) {
            const entry = entries.next();
            if (entry.done) return;

            if (time > (dEntries.next().value?.[1] || 0)) {
                const k = entry.value[0];

                onSweep?.(entry.value[1], k);
                this.delete(k);
            }
        }
    }

    * #mapGenerator<T>(
        mapFn: (value: V, key: K, self: this) => T,
        filterFn?: (value: V, key: K, self: this) => boolean
    ) {
        const entries = this.entries();

        // The code duplication is intentional to avoid unnecessary conditions.

        if (filterFn) {
            while (true) {
                const iter = entries.next();
                if (iter.done) return;

                const [k, v] = iter.value;
                if (filterFn(v, k, this)) {
                    yield mapFn(v, k, this);
                }
            }
        }

        while (true) {
            const iter = entries.next();
            if (iter.done) return;

            yield mapFn(iter.value[1], iter.value[0], this);
        }
    }
}

// CAUTION TS currently doesn't include this comment in the generated index.d.ts file.
// As a result it throws an error when "skipLibCheck" is false.
export default SuperMap;

export interface SuperMapOptions<K = any, V = any> {
    onSweep: (value: V, key: K) => any;
    intervalTime: number;
    expireAfter: number;
    itemsLimit: number;
}

type RequiredPick<T, K extends keyof T> = Partial<T> & { [P in K]-?: T[P] };