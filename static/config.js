// Configuration for fare calculations
const fareConfigs = {
    'taxi': {
        'normal': {
            minCharge: 40.95,
            baseFare: 15.5,
            perMinPrice: 2.1,
            perKmRates: [
                { maxKm: 5, rate: 5.59 },
                { maxKm: 10, rate: 6.79 },
                { maxKm: 15, rate: 6.64 },
                { maxKm: Infinity, rate: 5.39 }
            ]
        },
        'fromAirport': {
            minCharge: 42.95,
            baseFare: 15.5,
            perMinPrice: 2.1,
            perKmRates: [
                { maxKm: 5, rate: 5.87 },
                { maxKm: 10, rate: 7.13 },
                { maxKm: 15, rate: 6.64 },
                { maxKm: Infinity, rate: 5.39 }
            ]
        },
        'toAirport': {
            minCharge: 40.95,
            baseFare: 15.5,
            perMinPrice: 2.1,
            perKmRates: [
                { maxKm: 5, rate: 5.59 },
                { maxKm: 10, rate: 6.79 },
                { maxKm: 15, rate: 6.31 },
                { maxKm: Infinity, rate: 5.12 }
            ]
        }
    },
    'uberx': {
        'normal': {
            minCharge: 40.95,
            baseFare: 18,
            perMinPrice: 2.04,
            perKmRates: [
                { maxKm: 5, rate: 4.73 },
                { maxKm: 10, rate: 5.23 },
                { maxKm: 15, rate: 5.63 },
                { maxKm: Infinity, rate: 4.88 }
            ]
        },
        'fromAirport': {
            minCharge: 42.95,
            baseFare: 18,
            perMinPrice: 2.04,
            perKmRates: [
                { maxKm: 5, rate: 4.97 },
                { maxKm: 10, rate: 5.49 },
                { maxKm: 15, rate: 5.63 },
                { maxKm: Infinity, rate: 4.88 }
            ]
        },
        'toAirport': {
            minCharge: 40.95,
            baseFare: 18,
            perMinPrice: 2.04,
            perKmRates: [
                { maxKm: 5, rate: 4.73 },
                { maxKm: 10, rate: 5.23 },
                { maxKm: 15, rate: 5.35 },
                { maxKm: Infinity, rate: 4.64 }
            ]
        }
    },
    'comfort': {
        'normal': {
            minCharge: 56,
            baseFare: 26.85,
            perMinPrice: 1.6,
            perKmPrice: 6.29
        }
    },
    'uberxl': {
        'normal': {
            minCharge: 75,
            baseFare: 40,
            perMinPrice: 1.9,
            perKmPrice: 8.68
        }
    },
    'uberxxl': {
        'normal': {
            minCharge: 80,
            baseFare: 45,
            perMinPrice: 1.9,
            perKmPrice: 9.22
        }
    },
    'black': {
        'normal': {
            minCharge: 90,
            baseFare: 45,
            perMinPrice: 1.9,
            perKmPrice: 9.22
        }
    }
};

// Column visibility mappings (Checkbox ID -> Column Index)
const columnMappings = {
    'toggleTime': 0,
    'toggleType': 1,
    'toggleDuration': 2,
    'toggleDistance': 3,
    'toggleSurge': 4,
    'toggleWaitingFee': 5,
    'toggleTip': 6,
    'togglePrice': 7,
    'toggleCalcPrice': 8,
    'toggleDiff': 9,
    'toggleAirport': 10
};
