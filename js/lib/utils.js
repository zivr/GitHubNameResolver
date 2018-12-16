class Utils {
    static debounce(func, wait, context = this) {
        if (isNaN(wait)) {
            throw 'wait is not a number!'
        }
        let timeout = null;
        return (...args) => {
            clearTimeout(timeout);
            if (wait === 0) {
                func.apply(context, args);
            } else {
                timeout = setTimeout(() => {
                    timeout = null;
                    func.apply(context, args);
                }, wait);
            }
        };
    };
}