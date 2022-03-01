const {
    validateSortBy,
    validateSortOrder,
    postSort,
    removePostDuplicates
} = require('../src/arrayFunctions');

test('Validate Sort By: true', () => {
    expect(validateSortBy("id")).toBeTruthy();
});

test('Validate Sort By: false', () => {
    expect(validateSortBy("authorid")).toBeFalsy();
});

test('Validate Sort Order: true', () => {
    expect(validateSortOrder("asc")).toBeTruthy();
});

test('Validate Sort Order: false', () => {
    expect(validateSortOrder("ascendent")).toBeFalsy();
});

test('Validate Sort: Asc', () => {
    let list = [{ "id": 2 }, {"id": 1 }];
    let expectedList = [{ "id": 1 }, {"id": 2 }];
    expect(postSort(list, "id", "asc")).toMatchObject(expectedList);
});

test('Validate Sort: Desc', () => {
    let list = [{ "id": 1 }, {"id": 2 }];
    let expectedList = [{ "id": 2 }, {"id": 1 }];
    expect(postSort(list, "id", "desc")).toMatchObject(expectedList);
});

test('Remove Duplicates', () => {
    let list = [{ "id": 1 }, {"id": 1 }];
    let expectedList = [{ "id": 1 }];
    expect(removePostDuplicates(list)).toMatchObject(expectedList);
});