/**
 * Green Haven - Centralized Form Input Validation Engine
 * 
 * Strict Validation Specifications:
 * 1. Name Fields:
 *    - Letters only (A-Z, a-z)
 *    - Spaces allowed between names (single space)
 *    - No numbers, no special characters (@, #, 123, etc.)
 *    - Minimum 2 characters
 *    - Blocks invalid characters in real-time during keypress, beforeinput, and paste
 * 
 * 2. Number Fields (Phone / Mobile / Quantity / Age / Amount / ZIP / CVV):
 *    - Numbers only (0-9)
 *    - No alphabets, no symbols (+, -, e, ., etc.)
 *    - Mobile/Phone numbers: exactly 10 digits
 *    - Real-time keystroke blocking prevents typing invalid characters directly
 * 
 * 3. Email Fields:
 *    - Strict email format: localPart @ domain . extension (min 2 letters)
 *    - No spaces allowed
 *    - Clear specific feedback (missing @, missing domain, etc.)
 * 
 * 4. Required Fields:
 *    - Clear message below input when empty
 *    - Blocks submission until valid
 * 
 * 5. Real-Time Feedback:
 *    - Clears errors immediately when valid data is entered
 *    - Updates UI with Bootstrap is-invalid / is-valid and .invalid-feedback
 */

(function (window, document) {
  'use strict';

  // Regular expressions
  const REGEX = {
    // Letters only and single spaces between words (e.g., "Ranjith", "Ranjith Kumar", "Sri Devi")
    NAME: /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
    // Exactly 10 numeric digits
    PHONE_10: /^\d{10}$/,
    // Digits only
    DIGITS: /^\d+$/,
    // Strict email format requiring valid domain and TLD (e.g., name@example.com)
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // 5 or 6 digit ZIP / Pincode
    ZIP: /^\d{5,6}$/
  };

  /**
   * Helper: Locate or dynamically create the feedback element below an input
   */
  function getFeedbackElement(input) {
    if (!input) return null;
    if (input.id) {
      const explicit = document.getElementById(input.id + 'Feedback');
      if (explicit) return explicit;
    }

    const inputGroup = input.closest ? input.closest('.input-group') : null;
    const parent = inputGroup || input;

    // Check sibling
    let next = parent.nextElementSibling;
    if (next && next.classList && next.classList.contains('invalid-feedback')) {
      return next;
    }

    // Check parent container
    if (parent.parentElement) {
      const existing = parent.parentElement.querySelector(':scope > .invalid-feedback');
      if (existing) return existing;
    }

    // Create feedback element if not present
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.style.display = 'none';
    if (parent.nextSibling) {
      parent.parentNode.insertBefore(feedback, parent.nextSibling);
    } else {
      parent.parentNode.appendChild(feedback);
    }
    return feedback;
  }

  /**
   * Set field error state with message
   */
  function setFieldError(input, message) {
    if (!input) return;
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    if (typeof input.setCustomValidity === 'function') {
      input.setCustomValidity(message);
    }
    const feedback = getFeedbackElement(input);
    if (feedback) {
      feedback.textContent = message;
      feedback.style.display = 'block';
    }
  }

  /**
   * Clear field error state
   */
  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('is-invalid');
    if (typeof input.setCustomValidity === 'function') {
      input.setCustomValidity('');
    }
    const feedback = getFeedbackElement(input);
    if (feedback) {
      feedback.textContent = '';
      feedback.style.display = 'none';
    }
  }

  /**
   * Mark field as valid
   */
  function setFieldValid(input) {
    if (!input) return;
    clearFieldError(input);
    // Suppress is-valid class on password fields and login form inputs to avoid tick icons
    if (
      input.type === 'password' ||
      input.classList.contains('gh-password-input') ||
      (input.form && input.form.id === 'loginForm') ||
      (typeof input.closest === 'function' && (input.closest('#loginForm') || input.closest('.gh-password-group')))
    ) {
      input.classList.remove('is-valid');
      return;
    }
    // Only show green is-valid if form has been interacted with
    if (input.form && (input.form.classList.contains('was-validated') || input.value.trim().length > 0)) {
      input.classList.add('is-valid');
    }
  }

  /* ================================================================
     VALIDATION LOGIC
     ================================================================ */

  /**
   * 1. Validate Name
   */
  function validateName(value, isRequired = true, fieldLabel = 'Full Name') {
    const val = String(value || '').trim();

    if (!val) {
      if (isRequired) {
        return { isValid: false, message: `Please enter your ${fieldLabel.toLowerCase()}.` };
      }
      return { isValid: true, message: '' };
    }

    if (val.length < 2) {
      return { isValid: false, message: `${fieldLabel} must be at least 2 characters long.` };
    }

    // Check for digits or special characters
    if (/[0-9]/.test(val)) {
      return { isValid: false, message: `${fieldLabel} must not contain numbers. Letters only.` };
    }

    if (/[^a-zA-Z\s]/.test(val)) {
      return { isValid: false, message: `${fieldLabel} cannot contain special characters. Letters only.` };
    }

    if (!REGEX.NAME.test(val)) {
      return { isValid: false, message: `${fieldLabel} can only contain letters and spaces (e.g. Ranjith Kumar).` };
    }

    return { isValid: true, message: '' };
  }

  /**
   * 2. Validate Mobile / Phone Number
   */
  function validatePhone(value, isRequired = true, fieldLabel = 'Phone Number') {
    const val = String(value || '').trim();

    if (!val) {
      if (isRequired) {
        return { isValid: false, message: `Please enter your ${fieldLabel.toLowerCase()}.` };
      }
      return { isValid: true, message: '' };
    }

    if (!REGEX.DIGITS.test(val)) {
      return { isValid: false, message: `${fieldLabel} must contain numbers only.` };
    }

    if (val.length !== 10) {
      return { isValid: false, message: `${fieldLabel} must contain exactly 10 digits.` };
    }

    return { isValid: true, message: '' };
  }

  /**
   * 3. Validate Email Address
   */
  function validateEmail(value, isRequired = true, fieldLabel = 'Email Address') {
    const val = String(value || '').trim();

    if (!val) {
      if (isRequired) {
        return { isValid: false, message: `Please enter your ${fieldLabel.toLowerCase()}.` };
      }
      return { isValid: true, message: '' };
    }

    if (/\s/.test(val)) {
      return { isValid: false, message: `${fieldLabel} cannot contain spaces.` };
    }

    if (!val.includes('@')) {
      return { isValid: false, message: `${fieldLabel} must contain an '@' symbol.` };
    }

    const parts = val.split('@');
    if (!parts[1] || !parts[1].includes('.')) {
      return { isValid: false, message: 'Please include a valid domain extension like .com or .in.' };
    }

    const ext = parts[1].split('.').pop();
    if (ext.length < 2) {
      return { isValid: false, message: 'Domain extension must be at least 2 characters (e.g. .com, .in).' };
    }

    if (!REGEX.EMAIL.test(val)) {
      return { isValid: false, message: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * 4. Validate Quantity / Guest Count / Generic Number
   */
  function validateNumber(value, isRequired = true, min = null, max = null, fieldLabel = 'Number') {
    const val = String(value || '').trim();

    if (!val) {
      if (isRequired) {
        return { isValid: false, message: `Please enter ${fieldLabel.toLowerCase()}.` };
      }
      return { isValid: true, message: '' };
    }

    if (!REGEX.DIGITS.test(val)) {
      return { isValid: false, message: `${fieldLabel} must contain numbers only.` };
    }

    const num = parseInt(val, 10);
    if (isNaN(num)) {
      return { isValid: false, message: `Please enter a valid numeric ${fieldLabel.toLowerCase()}.` };
    }

    if (min !== null && num < min) {
      return { isValid: false, message: `${fieldLabel} must be at least ${min}.` };
    }

    if (max !== null && num > max) {
      return { isValid: false, message: `${fieldLabel} cannot exceed ${max}.` };
    }

    return { isValid: true, message: '' };
  }

  /**
   * 5. Validate ZIP / Pincode
   */
  function validateZip(value, isRequired = true, fieldLabel = 'ZIP / Pincode') {
    const val = String(value || '').trim();

    if (!val) {
      if (isRequired) {
        return { isValid: false, message: `Please enter ${fieldLabel.toLowerCase()}.` };
      }
      return { isValid: true, message: '' };
    }

    if (!REGEX.DIGITS.test(val)) {
      return { isValid: false, message: `${fieldLabel} must contain numbers only.` };
    }

    if (val.length < 5 || val.length > 6) {
      return { isValid: false, message: `${fieldLabel} must be 5 or 6 digits.` };
    }

    return { isValid: true, message: '' };
  }

  /**
   * 6. Generic Required Validation
   */
  function validateRequired(value, fieldLabel = 'This field') {
    const val = String(value || '').trim();
    if (!val) {
      return { isValid: false, message: `${fieldLabel} is required.` };
    }
    return { isValid: true, message: '' };
  }

  /* ================================================================
     REAL-TIME KEYSTROKE & INPUT SANITIZERS
     ================================================================ */

  const CONTROL_KEYS = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];

  /**
   * Restrict input strictly to letters and spaces
   */
  function restrictNameInput(input, isRequired = true, fieldLabel = 'Full Name') {
    if (!input || input.dataset.nameRestricted) return;
    input.dataset.nameRestricted = 'true';

    const validate = () => {
      const res = validateName(input.value, isRequired, fieldLabel);
      if (!res.isValid) {
        setFieldError(input, res.message);
        return false;
      } else {
        setFieldValid(input);
        return true;
      }
    };

    // Block non-letters on keydown
    input.addEventListener('keydown', function (e) {
      if (CONTROL_KEYS.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (e.key.startsWith('F') && e.key.length > 1) return;

      // Single space between names, no leading space
      if (e.key === ' ') {
        const pos = this.selectionStart ?? this.value.length;
        if (pos === 0 || this.value.charAt(pos - 1) === ' ') {
          e.preventDefault();
        }
        return;
      }

      // Allow letters only (A-Z, a-z)
      if (!/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Mobile / Virtual keyboard beforeinput prevention
    input.addEventListener('beforeinput', function (e) {
      if (!e.data) return;
      if (/[^a-zA-Z\s]/.test(e.data)) {
        e.preventDefault();
      }
    });

    // Paste handler: strips numbers & special characters
    input.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      let cleaned = pasteText.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');
      if (!cleaned) return;

      const start = this.selectionStart ?? this.value.length;
      const end = this.selectionEnd ?? this.value.length;
      const currentVal = this.value;

      if (start === 0 && cleaned.startsWith(' ')) {
        cleaned = cleaned.trimStart();
      }
      if (!cleaned) return;

      this.value = currentVal.slice(0, start) + cleaned + currentVal.slice(end);
      const newCursor = start + cleaned.length;
      this.setSelectionRange(newCursor, newCursor);
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Live input sanitization & real-time error clearing
    input.addEventListener('input', function () {
      const start = this.selectionStart;
      let cleaned = this.value.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');
      if (cleaned.startsWith(' ')) {
        cleaned = cleaned.trimStart();
      }
      if (this.value !== cleaned) {
        this.value = cleaned;
        if (start !== null) {
          const newPos = Math.min(start, cleaned.length);
          this.setSelectionRange(newPos, newPos);
        }
      }

      // Check validity live: immediately clear error when user types valid data
      const res = validateName(this.value, isRequired, fieldLabel);
      if (res.isValid) {
        setFieldValid(this);
      } else if (this.classList.contains('is-invalid') || (this.form && this.form.classList.contains('was-validated'))) {
        setFieldError(this, res.message);
      }
    });

    // Blur validation
    input.addEventListener('blur', function () {
      this.value = this.value.trim();
      if (this.form && this.form.classList.contains('was-validated')) {
        validate();
      } else if (this.value) {
        validate();
      }
    });

    input._validateFn = validate;
    return validate;
  }

  /**
   * Restrict input strictly to digits (0-9)
   */
  function restrictDigitsInput(input, maxDigits = null, isRequired = false, fieldLabel = 'Number', min = null, max = null) {
    if (!input || input.dataset.digitsRestricted) return;
    input.dataset.digitsRestricted = 'true';

    const validate = () => {
      let res;
      if (maxDigits === 10) {
        res = validatePhone(input.value, isRequired, fieldLabel);
      } else if (maxDigits === 6 && (fieldLabel.toLowerCase().includes('zip') || fieldLabel.toLowerCase().includes('pincode'))) {
        res = validateZip(input.value, isRequired, fieldLabel);
      } else {
        res = validateNumber(input.value, isRequired, min, max, fieldLabel);
      }

      if (!res.isValid) {
        setFieldError(input, res.message);
        return false;
      } else {
        setFieldValid(input);
        return true;
      }
    };

    // Block non-digits on keydown
    input.addEventListener('keydown', function (e) {
      if (CONTROL_KEYS.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (e.key.startsWith('F') && e.key.length > 1) return;

      // Disallow non-numeric characters (also blocks +, -, e, .)
      if (!/^[0-9]$/.test(e.key) || e.shiftKey) {
        e.preventDefault();
        return;
      }

      // Max digits limit check
      if (maxDigits !== null) {
        const selLen = (this.selectionEnd ?? 0) - (this.selectionStart ?? 0);
        if (this.value.length >= maxDigits && selLen === 0) {
          e.preventDefault();
        }
      }
    });

    // beforeinput
    input.addEventListener('beforeinput', function (e) {
      if (e.data && !/^\d+$/.test(e.data)) {
        e.preventDefault();
      }
    });

    // Paste handler
    input.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      const numbersOnly = pasteText.replace(/\D/g, '');
      if (!numbersOnly) return;

      const start = this.selectionStart ?? this.value.length;
      const end = this.selectionEnd ?? this.value.length;
      const currentVal = this.value;

      let availableSpace = numbersOnly.length;
      if (maxDigits !== null) {
        availableSpace = maxDigits - (currentVal.length - (end - start));
        if (availableSpace <= 0) return;
      }

      const toInsert = numbersOnly.slice(0, availableSpace);
      this.value = currentVal.slice(0, start) + toInsert + currentVal.slice(end);
      const newCursor = start + toInsert.length;
      this.setSelectionRange(newCursor, newCursor);
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Input handler
    input.addEventListener('input', function () {
      const start = this.selectionStart;
      let cleaned = this.value.replace(/\D/g, '');
      if (maxDigits !== null) {
        cleaned = cleaned.slice(0, maxDigits);
      }

      if (this.value !== cleaned) {
        this.value = cleaned;
        if (start !== null) {
          const newPos = Math.min(start, cleaned.length);
          this.setSelectionRange(newPos, newPos);
        }
      }

      // Check validity live: clear error as soon as valid length/number reached
      let res;
      if (maxDigits === 10) {
        res = validatePhone(this.value, isRequired, fieldLabel);
      } else if (maxDigits === 6 && (fieldLabel.toLowerCase().includes('zip') || fieldLabel.toLowerCase().includes('pincode'))) {
        res = validateZip(this.value, isRequired, fieldLabel);
      } else {
        res = validateNumber(this.value, isRequired, min, max, fieldLabel);
      }

      if (res.isValid) {
        setFieldValid(this);
      } else if (this.classList.contains('is-invalid') || (this.form && this.form.classList.contains('was-validated'))) {
        setFieldError(this, res.message);
      }
    });

    // Blur handler
    input.addEventListener('blur', function () {
      if (this.form && this.form.classList.contains('was-validated')) {
        validate();
      } else if (this.value) {
        validate();
      }
    });

    input._validateFn = validate;
    return validate;
  }

  /**
   * Restrict email input (disallow spaces, validate email format)
   */
  function restrictEmailInput(input, isRequired = true, fieldLabel = 'Email Address') {
    if (!input || input.dataset.emailRestricted) return;
    input.dataset.emailRestricted = 'true';

    const validate = () => {
      const res = validateEmail(input.value, isRequired, fieldLabel);
      if (!res.isValid) {
        setFieldError(input, res.message);
        return false;
      } else {
        setFieldValid(input);
        return true;
      }
    };

    // Disallow spaces
    input.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
      }
    });

    input.addEventListener('beforeinput', function (e) {
      if (e.data && /\s/.test(e.data)) {
        e.preventDefault();
      }
    });

    input.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      const cleaned = pasteText.replace(/\s/g, '');
      if (!cleaned) return;

      const start = this.selectionStart ?? this.value.length;
      const end = this.selectionEnd ?? this.value.length;
      const currentVal = this.value;

      this.value = currentVal.slice(0, start) + cleaned + currentVal.slice(end);
      const newCursor = start + cleaned.length;
      this.setSelectionRange(newCursor, newCursor);
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });

    input.addEventListener('input', function () {
      const start = this.selectionStart;
      const cleaned = this.value.replace(/\s/g, '');
      if (this.value !== cleaned) {
        this.value = cleaned;
        if (start !== null) {
          const newPos = Math.min(start, cleaned.length);
          this.setSelectionRange(newPos, newPos);
        }
      }

      // Live validity check: clear error immediately when valid
      const res = validateEmail(this.value, isRequired, fieldLabel);
      if (res.isValid) {
        setFieldValid(this);
      } else if (this.classList.contains('is-invalid') || (this.form && this.form.classList.contains('was-validated'))) {
        setFieldError(this, res.message);
      }
    });

    input.addEventListener('blur', function () {
      this.value = this.value.trim();
      if (this.form && this.form.classList.contains('was-validated')) {
        validate();
      } else if (this.value) {
        validate();
      }
    });

    input._validateFn = validate;
    return validate;
  }

  /* ================================================================
     AUTO-INITIALIZATION & FORM BINDING
     ================================================================ */

  /**
   * Determine field label from <label for="..."> or placeholder
   */
  function determineFieldLabel(input) {
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        return label.textContent.replace(/[*:\u200E]/g, '').trim();
      }
    }
    if (input.placeholder) {
      const ph = input.placeholder.replace(/e\.g\.|\.\.\.|[*:\u200E]/gi, '').trim();
      if (ph) return ph;
    }
    return input.name || input.id || 'Field';
  }

  /**
   * Automatically bind all inputs within a container or form
   */
  function autoBindInputs(scope = document) {
    const inputs = scope.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      if (input.dataset.validationBound) return;
      input.dataset.validationBound = 'true';

      const type = (input.type || '').toLowerCase();
      const tagName = (input.tagName || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const isRequired = input.hasAttribute('required') || input.required;
      const label = determineFieldLabel(input);

      // 1. Name fields (custName, resName, cateringName, contactName, regFirstName, regLastName, profName, commentName, etc.)
      const isNameField = (
        id.includes('name') ||
        name.includes('name') ||
        label.toLowerCase().includes('name')
      ) && !id.includes('user') && type !== 'hidden' && type !== 'checkbox';

      if (isNameField && (type === 'text' || type === '')) {
        restrictNameInput(input, isRequired, label);
        return;
      }

      // 2. Mobile / Phone fields
      const isPhoneField = (
        type === 'tel' ||
        id.includes('phone') ||
        name.includes('phone') ||
        id.includes('mobile') ||
        name.includes('mobile') ||
        label.toLowerCase().includes('phone') ||
        label.toLowerCase().includes('mobile')
      );

      if (isPhoneField) {
        restrictDigitsInput(input, 10, isRequired, label || 'Phone Number');
        return;
      }

      // 3. Email fields
      const isEmailField = (
        type === 'email' ||
        id.includes('email') ||
        name.includes('email') ||
        label.toLowerCase().includes('email')
      );

      if (isEmailField) {
        restrictEmailInput(input, isRequired, label || 'Email Address');
        return;
      }

      // 4. ZIP / Pincode fields
      const isZipField = (
        id.includes('zip') ||
        name.includes('zip') ||
        id.includes('pincode') ||
        label.toLowerCase().includes('zip') ||
        label.toLowerCase().includes('pincode')
      );

      if (isZipField) {
        restrictDigitsInput(input, 6, isRequired, label || 'ZIP / Pincode');
        return;
      }

      // 5. Quantity / Guests / Numeric input fields
      const isNumericField = (
        type === 'number' ||
        (tagName !== 'textarea' && (
          /(?:^|[_\-])guest(?:s)?(?:[_\-]|$)/i.test(id) ||
          /(?:^|[_\-])qty(?:[_\-]|$)/i.test(id) ||
          /(?:^|[_\-])quantity(?:[_\-]|$)/i.test(id) ||
          /(?:^|[_\-])amount(?:[_\-]|$)/i.test(id) ||
          /\bage\b/i.test(label) ||
          /\b(quantity|guests|pax)\b/i.test(label)
        ))
      );

      if (isNumericField && type !== 'hidden' && tagName !== 'textarea') {
        const minVal = input.hasAttribute('min') ? parseInt(input.getAttribute('min'), 10) : null;
        const maxVal = input.hasAttribute('max') ? parseInt(input.getAttribute('max'), 10) : null;
        restrictDigitsInput(input, null, isRequired, label || 'Number', minVal, maxVal);
        return;
      }

      // 6. Generic Required fields (textareas, selects, other text inputs)
      if (isRequired) {
        const validateGeneric = () => {
          const res = validateRequired(input.value, label);
          if (!res.isValid) {
            setFieldError(input, res.message);
            return false;
          } else {
            setFieldValid(input);
            return true;
          }
        };

        input.addEventListener('input', function () {
          if (this.value.trim().length > 0) {
            setFieldValid(this);
          } else if (this.classList.contains('is-invalid') || (this.form && this.form.classList.contains('was-validated'))) {
            setFieldError(this, `${label} is required.`);
          }
        });

        input.addEventListener('change', function () {
          if (this.value.trim().length > 0) {
            setFieldValid(this);
          }
        });

        input._validateFn = validateGeneric;
      }
    });
  }

  /**
   * Validate entire form
   */
  function validateForm(form) {
    if (!form) return true;
    let isAllValid = true;
    let firstInvalid = null;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.disabled || input.type === 'hidden') return;

      let valid = true;
      if (typeof input._validateFn === 'function') {
        valid = input._validateFn();
      } else if (input.required) {
        const val = input.value.trim();
        if (!val) {
          const label = determineFieldLabel(input);
          setFieldError(input, `${label} is required.`);
          valid = false;
        } else {
          setFieldValid(input);
        }
      }

      if (!valid) {
        isAllValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!isAllValid) {
      form.classList.add('was-validated');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    } else {
      form.classList.remove('was-validated');
    }

    return isAllValid;
  }

  /**
   * Reset form and clear all errors
   */
  function resetFormValidation(form) {
    if (!form) return;
    form.classList.remove('was-validated');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      clearFieldError(input);
      input.classList.remove('is-valid');
    });
  }

  /* ================================================================
     PUBLIC API EXPOSURE
     ================================================================ */

  const GreenHavenValidator = {
    REGEX,
    validateName,
    validatePhone,
    validateEmail,
    validateNumber,
    validateZip,
    validateRequired,
    restrictNameInput,
    restrictDigitsInput,
    restrictEmailInput,
    getFeedbackElement,
    setFieldError,
    clearFieldError,
    setFieldValid,
    autoBindInputs,
    validateForm,
    resetFormValidation,
    init() {
      autoBindInputs(document);
    }
  };

  // Attach to window
  window.GreenHavenValidator = GreenHavenValidator;
  window.GH_Validator = GreenHavenValidator;

  // Backward compatibility with legacy setup names
  window.setupValidNameInput = (input, isRequired = true, label = 'Full Name') => restrictNameInput(input, isRequired, label);
  window.setupNumericPhoneInput = (input, isRequired = true, label = 'Phone Number') => restrictDigitsInput(input, 10, isRequired, label);
  window.setupValidEmailInput = (input, isRequired = true, label = 'Email Address') => restrictEmailInput(input, isRequired, label);

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GreenHavenValidator.init());
  } else {
    GreenHavenValidator.init();
  }

})(window, document);
