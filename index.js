class Create {
  constructor() {
    this.form = document.querySelector('.form');

    //создаем заголовок
    this.title = this.createElement('h1', 'title');
    this.title.textContent = 'Search for repositories';

    this.label = this.createElement('label', 'label');

    //создаем поле ввода
    this.input = this.createElement('input', 'input');
    this.input.type = 'search';
    this.input.placeholder = 'Type to search...';
    this.label.append(this.input);

    //создаем контейнер для выпадашки
    this.dropdown = this.createElement('ul', 'dropdown');
    this.dropdown.style.display = 'none';

    //контейнер для списка репозиториев
    this.repositoriesList = this.createElement('ul', 'repositorie-list');

    //контейнер для пустого результата
    this.message = this.createElement('span', 'message');
    this.message.textContent = 'No such repository';

    //отрисовываем элементы
    this.form.append(this.title);
    this.form.append(this.label);
    this.form.append(this.dropdown);
    this.form.append(this.repositoriesList);
  }

  //функция создания элементов
  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag);
    if (elementClass) {
      element.classList.add(elementClass);
    }
    return element;
  }

  //создаем каждого юзера и аппендим в выпадашку
  createUser(userData) {
    const userElement = this.createElement('li', 'userItem');
    userElement.addEventListener('click', () => this.showUserData(userData));
    userElement.innerHTML = `${userData.name}`;
    this.dropdown.append(userElement); //вывод в выпадающее меню
    if (this.dropdown.contains(userElement)) {
      this.dropdown.style.display = 'block';
    }
  }

  //вывод информации
  showUserData(userData) {
    const repositoriesItems = this.createElement('li', 'repositories-items');
    let closeButton = this.createElement('button', 'close-btn'); //кнопка удаления
    this.repositoriesList.append(repositoriesItems);
    repositoriesItems.append(closeButton);
    repositoriesItems.innerHTML += `Name: ${userData.name}<br><br> Owner: ${userData.owner.login}<br><br> Stars: ${userData.stargazers_count}<br><br>`;
    //удаляем элементы из списка по клику
    repositoriesItems.addEventListener('click', (element) => {
      repositoriesItems.removeEventListener('click', element);
      if (!element.target.classList.contains('close-btn')) {
        return;
      }
      element.target.parentElement.remove();
    });
    this.input.value = ''; //после клика очищаем поле ввода
    this.clearDropdown(); //очищаем автокомплит после клика
  }

  //удаляем элементы при пустом поле ввода
  clearDropdown() {
    this.dropdown.innerHTML = '';
    this.dropdown.style.display = 'none';
  }
}

class Search {
  constructor(create) {
    this.createUsers = create;

    //делаем задержку при вводе
    this.createUsers.input.addEventListener(
      'input',
      this.debounce(this.searchRepositories.bind(this), 500)
    );
  }

  async searchRepositories() {
    if (this.createUsers.input.value) {
      this.createUsers.clearDropdown(); //обновляем данные при вводе
      //проверяем поле ввода
      try {
        return await fetch(
          `https://api.github.com/search/repositories?q=${this.createUsers.input.value}stars%3A%3E0&sort=stars&order=desc&per_page=5`
        ).then((response) => {
          response.json().then((response) => {
            if (response.total_count === 0) {
              //если нет репозитория выводим сообщение
              if (this.createUsers.message.style.display === 'none') {
                this.createUsers.message.style.display = 'block';
              }
              this.message();
            } else {
              this.clearMessage();
            }
            response.items.forEach((user) => this.createUsers.createUser(user));
          });
        });
      } catch (error) {
        console.log('Error: ' + error);
      }
    } else {
      //если поле ввода пустое, то удаляем элементы из выпадашки
      this.createUsers.clearDropdown();
    }
  }

  //вывод сообщения, если ничего не найдено
  message() {
    this.createUsers.form.append(this.createUsers.message);
  }

  //скрываем сообщение
  clearMessage() {
    this.createUsers.message.style.display = 'none';
  }

  debounce(fn, debounceTime) {
    let timeout;
    return function () {
      const fnCall = () => {
        fn.apply(this, arguments);
      };
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, debounceTime);
    };
  }
}

new Search(new Create());
