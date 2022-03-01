const { validateSortBy, validateSortOrder, postSort } = require('../src/arrayFunctions');

test('Validate Sort By: true', () => {
    expect(validateSortBy("id")).toBe('09:05');
});

test('Validate Sort By: false', () => {
    expect(validateSortBy("authorid")).toBe('09:05');
});