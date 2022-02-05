# :man_student::iphone::fire: Расписание ВЛгУ
Приложение для просмотра удобного простмотра расписания занятий унивеситета ВЛгУ
### Backend:
* Node.js
* TypeScript
* express
* MongoDB

### Frontend web:
* React.js
* Redux

 ### Список задач:
 - [x] Определить границы ячейки, ее цвет и текст
 - [ ] Определить в тексте ячейки отдельно тип пары, преподаватели, название пары, кабинет, учесть записи типа с 10 недю по 18 нед. Если пар в одной ячейке несколько - разделить их
 - [ ] Сформировать расписание для групп на четную и нечетную неделю
 - [ ] Сформировать расписание для преподавателей

 > ### Запуск проекта
 > 1. В рабочей папке выполните команду git clone https://github.com/uraniumpiggy/schedule-vlsu.git
 > 2. Команда npm start скачивает недостающие пакеты, компилирует файл index.ts в index.js и запускает его

 ### Структура проекта
 - app - endpoints для запросов
 - institutesTimetables - pdf файлы с расписанием для каждого института
 - lib - пользовательские библиотеки
 - index.ts - точка входа, запускает сервер

### Текущий результат:
![image](https://user-images.githubusercontent.com/98849146/152606879-f92b1924-ecc2-43c2-b276-fcfd1ae7ad4a.png)
