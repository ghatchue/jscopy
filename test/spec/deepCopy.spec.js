'use strict';

// ====== Common objects and utilities
function extend(subclass, superclass) {
  function Temp() {}
  Temp.prototype = superclass.prototype;
  subclass.prototype = new Temp();
  subclass.prototype.constructor = subclass;
}

var Animal = function(a) {
  this.a = a;
};
var Dog = function(a, b) {
  Animal.call(this, a);
  this.b = b;
};
extend(Dog, Animal);


var es5 = Object.defineProperty && (function() {
    try {
      Object.defineProperty({}, 'x', {});
      return true;
    } catch (e) {
      return false;
    }
  })();
var if_es5_it = es5 ? it : xit;

// ====== Specs
describe('owl.clone', function() {

  var original = { a:'A', b:'B' };
  var clone = owl.clone(original);

  it('should create a clone of an object', function() {
    expect(clone).not.toBe(original);
    expect(clone.a).toEqual('A');
    expect(clone.b).toEqual('B');
  });

  it('should not make changes to clone visible in original object', function() {
    clone.a = 'Apple';
    expect(clone.a).toEqual('Apple');
    expect(original.a).toEqual('A');
  });

  it('should make changes to original object visible through clone', function() {
    original.b = 'Banana';
    expect(original.b).toEqual('Banana');
    expect(clone.b).toEqual('Banana');
  });

  it('should not make new properties in clone visible in original object', function() {
    clone.c = 'Car';
    expect(original.c).toBeUndefined();
  });

  it('should make cloned property hide original property', function() {
    clone.a = 'Apple';
    original.a = 'Abracadabra';
    expect(clone.a).toEqual('Apple');
  });

  it('should make original property visible if cloned property is deleted', function() {
    clone.a = 'Apple';
    original.a = 'Abracadabra';
    delete clone.a;
    expect(clone.a).toEqual('Abracadabra');

    // repeating "delete clone.a" won't delete the original's value.
    delete clone.a;
    expect(original.a).toEqual('Abracadabra');
    expect(clone.a).toEqual('Abracadabra');
  });

  it('should return null for null value', function() {
    expect(owl.clone(null)).toBeNull();
  });

  it('should not clone non-object types', function() {
    var a = 1;
    var b = 'b';
    var c = true;
    var d = function() {};
    var e;
    expect(owl.clone(a)).toBe(a);
    expect(owl.clone(b)).toBe(b);
    expect(owl.clone(c)).toBe(c);
    expect(owl.clone(d)).toBe(d);
    expect(owl.clone(e)).toBe(e);
  });

});

describe('owl.copy', function() {

  it('should not copy non-object types, they have value semantics', function() {
    var a = 1;
    var b = 'b';
    var c = true;
    var d = function() {};
    var e;
    expect(owl.copy(a)).toBe(a);
    expect(owl.copy(b)).toBe(b);
    expect(owl.copy(c)).toBe(c);
    expect(owl.copy(d)).toBe(d);
    expect(owl.copy(e)).toBe(e);
  });

  it('should return null for null value', function() {
    expect(owl.copy(null)).toBeNull();
  });

  it('should copy primitive wrapper objects', function() {
    /*jshint -W053*/
    var a = new Number(123);
    var b = new String('abc');
    var c = new Boolean(true);
    var d = new Date();
    /*jshint +W053*/

    expect(owl.copy(a)).not.toBe(a);
    expect(owl.copy(b)).not.toBe(b);
    expect(owl.copy(c)).not.toBe(c);
    expect(owl.copy(d)).not.toBe(d);

    expect(owl.copy(a)).toEqual(a);
    expect(owl.copy(b)).toEqual(b);
    expect(owl.copy(c)).toEqual(c);
    expect(owl.copy(d)).toEqual(d);
  });

  it('should copy plain object properties', function() {
    var original = { a:'A', b:'B' };
    var copy = owl.copy(original);
    expect(copy).not.toBe(original);
    expect(copy.a).toEqual('A');
    expect(copy.b).toEqual('B');
  });

  it('should not make changes to original object visible through clone', function() {
    var original = { a:'A', b:'B' };
    var copy = owl.copy(original);
    original.b = 'Banana';
    expect(original.b).toEqual('Banana');
    expect(copy.b).toEqual('B');
  });

  it('should make shallow-copy of a plain object', function() {
    var original = { a:'A', b:{c:'C'} };
    var copy = owl.copy(original);
    original.b.c = 'Car';
    expect(copy.b.c).toEqual('Car');
  });


  if_es5_it('should copy non-enumerable properties of a plain object', function() {
    var original = { a: 'A' };
    Object.defineProperty(original, 'b', {
      value: 'B',
      writable: true,
      enumerable: false
    });
    var copy = owl.copy(original);
    expect(original.b).toEqual('B');
    expect(copy.b).toEqual('B');
  });

  if_es5_it('should copy non-enumerable properties of a user defined class', function() {
    var original = new Dog('A', 'B');
    Object.defineProperty(original, 'c', {
      value: 'C',
      writable: true,
      enumerable: false
    });
    var copy = owl.copy(original);
    expect(original.c).toEqual('C');
    expect(copy.c).toEqual('C');
  });

  it('should make shallow-copy of a class', function() {
    var original = new Dog('A', {c: 'C'});
    var copy = owl.copy(original);
    original.b.c = 'Car';
    expect(copy.b.c).toEqual('Car');
  });

  it('should copy a user defined class', function() {
    var original = new Dog('A', 'B');
    var copy = owl.copy(original);
    original.a = 'AA';
    expect(copy).not.toBe(original);
    expect(copy.a).toEqual('A');
    expect(copy.b).toEqual('B');
    expect(copy instanceof Dog).toBeTruthy();
    expect(copy instanceof Animal).toBeTruthy();
  });

  it('should copy properties of an object that overrides hasOwnProperty ', function() {
    var original = new Dog('A', 'B');
    /*jshint -W001*/
    original.hasOwnProperty = function() {
      return false;
    };
    /*jshint +W001*/
    var copy = owl.copy(original);
    original.a = 'AA';
    expect(copy).not.toBe(original);
    expect(copy.a).toEqual('A');
    expect(copy.b).toEqual('B');
    expect(copy instanceof Dog).toBeTruthy();
    expect(copy instanceof Animal).toBeTruthy();
  });

});
