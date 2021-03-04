import React, { useRef, useEffect } from 'react';

function classReg(className) {
  return new RegExp('(^|\\s+)' + className + '(\\s+|$)');
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
let hasClass, addClass, removeClass;

if ('classList' in document.documentElement) {
  hasClass = function (elem, c) {
    return elem.classList.contains(c);
  };
  addClass = function (elem, c) {
    elem.classList.add(c);
  };
  removeClass = function (elem, c) {
    elem.classList.remove(c);
  };
} else {
  hasClass = function (elem, c) {
    return classReg(c).test(elem.className);
  };
  addClass = function (elem, c) {
    if (!hasClass(elem, c)) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function (elem, c) {
    elem.className = elem.className.replace(classReg(c), ' ');
  };
}

function toggleClass(elem, c) {
  const fn = hasClass(elem, c) ? removeClass : addClass;
  fn(elem, c);
}

const classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

function onInputFocus(ev) {
  classie.add(ev.target.parentNode, 'input--filled');
}

function onInputBlur(ev) {
  if (ev.target.value.trim() === '') {
    classie.remove(ev.target.parentNode, 'input--filled');
  }
}

export const InputWrap = ({ label, children }) => {
  const node = useRef();

  useEffect(() => {
    if (!node.current) return;
    node.current.querySelectorAll('.input__field').forEach((inputEl) => {
      // in case the input is already filled..
      if (inputEl.value.trim() !== '') {
        classie.add(inputEl.parentNode, 'input--filled');
      }

      // events:
      inputEl.addEventListener('focus', onInputFocus);
      inputEl.addEventListener('blur', onInputBlur);
    });
  }, []);

  return (
    <span className="input input--fumi input--filled" ref={node}>
      {children}
      <label className="input__label input__label--fumi">
        <i className="fa fa-fw fa-key icon icon--fumi" />
        <span className="input__label-content input__label-content--fumi">{label}</span>
      </label>
    </span>
  );
};
