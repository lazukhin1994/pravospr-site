const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
const menuCloseButton = document.querySelector('.mobile-menu-close');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
menuCloseButton?.addEventListener('click', () => {
  closeMenu();
  menuButton?.focus();
});
const form = document.getElementById('preview-form');

const capitalizeName = value => value.replace(
  /^(\s*)([a-zа-яё])/iu,
  (_, spaces, firstLetter) => spaces + firstLetter.toLocaleUpperCase('ru-RU')
);

const formatRussianPhone = value => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  let formatted = '+7';
  if (digits.length) formatted += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
};

const phoneDigits = value => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
  return digits.slice(0, 10);
};

const phoneCaretAfterDigits = (formatted, localDigitCount) => {
  if (localDigitCount <= 0) return 2;
  let digitsSeen = 0;
  for (let index = 2; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) digitsSeen += 1;
    if (digitsSeen === localDigitCount) return index + 1;
  }
  return formatted.length;
};

document.querySelectorAll('input[name="client-name"]').forEach(input => {
  input.addEventListener('input', () => {
    const cursor = input.selectionStart;
    input.value = capitalizeName(input.value);
    if (cursor !== null) input.setSelectionRange(cursor, cursor);
  });
});

document.querySelectorAll('input[name="client-phone"]').forEach(input => {
  input.value = formatRussianPhone(input.value);
  input.addEventListener('focus', () => {
    if (!input.value.startsWith('+7')) input.value = '+7';
  });
  input.addEventListener('input', () => {
    input.value = formatRussianPhone(input.value);
  });
  input.addEventListener('keydown', event => {
    if (!['Backspace', 'Delete'].includes(event.key)) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    if (start !== end) return;

    const digits = phoneDigits(input.value);
    const localDigitsBeforeCaret = Math.max(
      0,
      input.value.slice(0, start).replace(/\D/g, '').length - 1
    );
    const deleteIndex = event.key === 'Backspace'
      ? localDigitsBeforeCaret - 1
      : localDigitsBeforeCaret;

    if (deleteIndex < 0 || deleteIndex >= digits.length) {
      if (event.key === 'Backspace' && start <= 2) event.preventDefault();
      return;
    }

    event.preventDefault();
    const nextDigits = digits.slice(0, deleteIndex) + digits.slice(deleteIndex + 1);
    input.value = formatRussianPhone(`7${nextDigits}`);
    const nextDigitPosition = event.key === 'Backspace'
      ? localDigitsBeforeCaret - 1
      : localDigitsBeforeCaret;
    const nextCaret = phoneCaretAfterDigits(input.value, nextDigitPosition);
    input.setSelectionRange(nextCaret, nextCaret);
  });
  input.addEventListener('blur', () => {
    if (!input.value.startsWith('+7')) input.value = '+7';
  });
});

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/Dron-mmr@mail.ru';

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const message = form.querySelector('.form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const name = form.querySelector('[name="client-name"]')?.value.trim();
  const phone = form.querySelector('[name="client-phone"]')?.value.trim();

  if (!name || !phone || phone.replace(/\D/g, '').length < 11) {
    message.textContent = 'Укажите имя и номер телефона.';
    return;
  }

  submitButton.disabled = true;
  message.textContent = 'Отправляем…';

  try {
    const formData = new FormData(form);
    formData.set('_subject', 'Заявка с сайта pravospr.ru');
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    if (!response.ok) throw new Error('bad response');
    message.textContent = 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
    form.reset();
    document.querySelectorAll('input[name="client-phone"]').forEach(input => { input.value = '+7 '; });
  } catch (error) {
    message.textContent = 'Не получилось отправить форму. Позвоните +7 991 750-96-96 или напишите в Telegram.';
  } finally {
    submitButton.disabled = false;
  }
});
