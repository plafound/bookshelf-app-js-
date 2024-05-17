const books = [];
const RENDER_EVENT = "render-book";

function addBook() {
  const textBook = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const yearInput = document.getElementById("year").value;
  const isValidYear = validateYear(yearInput);
  const checkbox = document.getElementById("completeCheckbox");

  if (isValidYear) {
    const year = parseInt(yearInput);
    const generatedID = generateID();
    if (checkbox.checked) {
      const bookObject = generateBookObject(generatedID, textBook, author, year, true);
      books.push(bookObject);
    } else {
      const bookObject = generateBookObject(generatedID, textBook, author, year, false);
      books.push(bookObject);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  } else {
    document.getElementById("errorDisplay").textContent = "Masukkan tahun yang valid (contoh: 2024)";
  }
}

function validateYear(year) {
  return /^\d{4}$/.test(year);
}

function generateID() {
  return +new Date();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById("books");
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completed-books");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.innerText = bookObject.title;
  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;
  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;
  const textContainer = document.createElement("div");
  textContainer.classList.add("col-9", "mt-4", "px-5", "py-3");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("col", "d-flex", "item", "shadow");
  container.append(textContainer);

  container.setAttribute("id", "book-${bookObject.id}");

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("btn", "btn-warning");
    undoButton.style.marginTop = "4rem";
    undoButton.style.marginBottom = "2px";

    undoButton.innerText = "Batalkan";

    undoButton.addEventListener("click", () => {
      undoTaskFomCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("btn", "btn-danger");
    trashButton.style.marginTop = "2px";
    trashButton.style.marginBottom = "4rem";
    trashButton.innerText = "Hapus";
    trashButton.addEventListener("click", () => {
      removeTaskFromCompleted(bookObject.id);
    });

    const rowCompleted = document.createElement("div");
    rowCompleted.classList.add("row", "mx-5");
    rowCompleted.append(undoButton, trashButton);
    const divCompleted = document.createElement("div");
    divCompleted.classList.add("col-3", "px-5");
    divCompleted.append(rowCompleted);

    container.append(divCompleted);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("btn", "btn-success");
    checkButton.style.marginTop = "4rem";
    checkButton.style.marginBottom = "2px";
    checkButton.innerText = "Sudah dibaca";
    checkButton.addEventListener("click", () => {
      addTaskToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("btn", "btn-danger");
    trashButton.style.marginTop = "2px";
    trashButton.style.marginBottom = "4rem";
    trashButton.innerText = "Hapus";
    trashButton.addEventListener("click", () => {
      removeTaskFromCompleted(bookObject.id);
    });

    const rowUncompleted = document.createElement("div");
    rowUncompleted.classList.add("row", "mx-5");
    rowUncompleted.append(checkButton, trashButton);
    const divUncompleted = document.createElement("div");
    divUncompleted.classList.add("col-3", "px-5");
    divUncompleted.append(rowUncompleted);

    container.append(divUncompleted);

    // const divCheckButton = document.createElement("div");
    // divCheckButton.classList.add("col-3", "d-flex", "justify-content-center");
    // divCheckButton.append(checkButton, trashButton);

    // container.append(divCheckButton);
  }

  return container;
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFomCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser does not support storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
