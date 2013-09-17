//добавим в прототип объекта метод для удаления элемента из dom
Object.prototype.remove = function(){
	this.parentNode.removeChild(this);
}

window.onload = function(){
	
	//зададим алфавит, по которому формируется последовательность
	var alphabet = {
		0:0,
		1:1,
		2:2,
		3:3,
		4:4,
		5:5,
		6:6,
		7:7,
		8:8,
		9:9,
		10:'a',
		11:'b',
		12:'c',
		13:'d',
		14:'e',
		15:'f',
		16:'g',
		17:'h',
		18:'i',
		19:'j',
		20:'k',
		21:'l',
		22:'m',
		23:'n',
		24:'o',
		25:'p',
		26:'q',
		27:'r',
		28:'s',
		29:'t',
		30:'u',
		31:'v',
		32:'w'
	};

	//определим уровни сложности: длина в символах, время в секундах
	var difficlultyLevel = {
		'easy':{
			'sequenceLength':30,
			'timer':120
		},
		'medium':{
			'sequenceLength':40,
			'timer':90
		},
		'hard':{
			'sequenceLength':50,
			'timer':60
		}
	};

	var second = 1000;
	var frames = 100;
	//fps для таймера
	var msInterval = second/frames;

	//определим таймер
	//x - координата по оси абсцисс
	//y - координата по оси ординат
	//radius - радиус окружности таймера
	//angleBegin - начальный угол для построения закрашенного сектора таймера
	//delta - шаг приращения угла, вычислямый как 2*Pi/(количество секунд таймера * количество кадров в секунду)
	//angleEnd - конечный угол для построения закрашенного сектора таймера
	//countdownTimer - идентификатор интервала, вызывающего функцию updateTimer каждые msInterval секунд
	//numberOfCallbacks - количество вызовов updateTimer
	//necessaryCallbacks - количество необходимых вызово функции updateTimer
	var timer = {
		'x':100,
		'y':80,
		'radius':60,
		'angleBegin':0,
		'delta':2 * Math.PI / (getTimerValue(getRadioParamsValue(document.getElementById('hardlevel'))) * frames),
		'angleEnd':0,
		'countdownTimer':null,
		'numberOfCallbacks':0,
		'necessaryCallbacks':0
	};

	//переменная, в которую позже будет записана сгенерированная последовательность
	var originSequence = 0;

	//функция, вычисляющая приращение таймера в случае, если пользователь выбрал уровень сложности, отличный от стандартного
	function updateTimerDelta(difficulty){
		timer.delta = 2 * Math.PI / (getTimerValue(getRadioParamsValue(document.getElementById('hardlevel'))) * frames);
	}

	//функция, подстраивающая размеры формы и контейнера ввода/вывода под длину генерируемой последовательности
	function adjustFormSize(){
		var difficlultyLevel = getRadioParamsValue(document.getElementById('hardlevel'));
		var sequenceOutputContainer = document.getElementById("io");
		var gameForm = document.getElementById("main");
		switch(difficlultyLevel){
			case 'easy':
				sequenceOutputContainer.className = 'short';
				gameForm.className = 'short';
				break;
			case 'medium':
				sequenceOutputContainer.className = 'medium';
				gameForm.className = 'medium';
				break;
			case 'hard':
				sequenceOutputContainer.className = 'long';
				gameForm.className = 'long';
				break;
		}
	}

	//функция, получающая значение выбранной группы радиобаттонов
	function getRadioParamsValue(radioParamsContainer){
		if(document.querySelectorAll){
			var radioButtons = radioParamsContainer.querySelectorAll("input[type='radio']");
		}
		else{
			var radioButtons = radioParamsContainer.getElementsByTagName('input');
		}
		for(var i in radioButtons){
			if(radioButtons[i].checked) return radioButtons[i].value;
		}
	}

	//функция, привязывающаяся к кнопке генерирования последовательности
	function getGeneratorButton(){
		return document.getElementById("generator");
	}

	//функция, привязывающаяся к кнопке проверки пользовательского ввода
	function getCheckButton(){
		return document.getElementById("check");	
	}

	//функция вывода сообщений, зависящих от действий пользователя
	function Notify(notifyClass){
		var message = document.createElement('p');
		switch(notifyClass){
			case 'warning':
				message.className = 'warning message';
				message.innerHTML = 'There is no input field yet.<br/>Initiate the timer or wait when it stops.'
				document.getElementById('wrapper').appendChild(message);
				break;
			case 'wining':
				message.className = 'wining message';
				message.innerHTML = 'That\'s right! Congratulations.'
				document.getElementById('wrapper').appendChild(message);
				break;
			case 'error':
				message.className = 'error message';
				message.innerHTML = 'Oops. Try again.';
				document.getElementById('wrapper').appendChild(message);
				break;
		}
	}

	//функция очистки предущих сообщений заданного класса (ошибка, предупреждение или поздравление)
	function removePreviousMessages(messageClass){
		var messages = document.getElementById('main').getElementsByTagName('p');
		for(var i = 0, j = messages.length; i < j; i++){
			if(messages[i].className === messageClass + ' message') messages[i].remove();
		}
	}

	//функция очистки всех предущих сообщений
	function clearPreviousMessages(){
		removePreviousMessages('warning');
		removePreviousMessages('wining');
		removePreviousMessages('error');
	}

	//функция проверки поля в конейнере io на существование
	function checkForExistance(fieldObject){
		if(fieldObject === -1){
			clearPreviousMessages();
			Notify('warning');
			return false;
		}
		return true;
	}

	//функция, замещающая кнопку с идентификатором replacementId кнопкой с идентификатором replacerId
	function swapButtons(replacementId,replacerId){
		document.getElementById(replacementId).remove();
		var newButton = document.createElement('div');
		newButton.setAttribute('id',replacerId);
		switch(replacerId){
			case 'newgame':
				newButton.innerHTML = 'New game';
				break;
			case 'generator':
				newButton.innerHTML = 'Generate';
				break;
		}
		document.getElementById('wrapper').appendChild(newButton);
	}

	//функция, заменяющая поле со сгенерированной последовательностью полем ввода результата
	function provideUserInput(){
		var userInput = document.createElement('input');
		userInput.className = 'sequence input';
		getSequenceField('output').remove();
		document.getElementById('io').appendChild(userInput);
	}

	//функция, закрашивающая на таймере сектор, соответствующий прошедшему времени
	function updateTimer(){
		var ctxt = document.getElementById('timer').getContext('2d');
		ctxt.fillStyle = 'gray';
		ctxt.beginPath();
		ctxt.arc(timer.x,timer.y,timer.radius,timer.angleBegin,timer.angleEnd,false);
		ctxt.lineTo(timer.x,timer.y);
		ctxt.closePath();
		ctxt.fill();
		timer.angleEnd += timer.delta;
		//если количество вызовов достигло расчетного значения, то
		//останавливаем таймер,
		//предлагаем пользователю ввести запомненную последовательность,
		//удаляем кнопку "generate", заменяя ее кнопкой "new game"
		//и описываем поведение добавленной кнопки
		if(timer.numberOfCallbacks++ >= timer.necessaryCallbacks){
			clearInterval(timer.countdownTimer);
			provideUserInput();
			swapButtons('generator','newgame');
			prepareNewGame();
		}
	}

	//функция, получающая значение таймера в секундах в зависимости от выбранного уровня сложности
	function getTimerValue(difficulty){
		return difficlultyLevel[difficulty]['timer'];
	}

	//кэп как бы намекает, что эта функция вернет количество милисекунд для переданного аргумента
	function adaptSecondsToMiliseconds(value){
		return value * 1000;
	}

	//функция обратного отсчета
	function countdown(){
		//получаем текущий уровень сложности
		var difficulty = getRadioParamsValue(document.getElementById('hardlevel'));
		//получаем значение таймера для этого уровня сложности
		var timerValue = getTimerValue(difficulty);
		//рассчитываем количество необходимых вызовов функции updateTimer
		timer.necessaryCallbacks = adaptSecondsToMiliseconds(timerValue) / msInterval;
		//вычисляем величину приращения таймера за один вызов updateTimer
		updateTimerDelta();
		//присваиваем идентификатор интервала переменной countdownTimer объекта timer
		timer.countdownTimer = setInterval(updateTimer,msInterval);
	}

	//функция, удаляющая из объектной модели документа элемент с идентификатором elementId
	function removeElement(elementId){
		document.getElementById(elementId).remove();
	}

	//функция, предотвращающая повторную генерацию последовательности, в случае,
	//если пользователь ранее нажал на кнопку "generate"
	function blockGenerator(){
		document.getElementById('generator').onclick = function(event){
			event.preventDefault();
		}
	}

	//функция подготовки кнопки генерирования последовательности
	function prepareGenerateButton(buttonObject,sequenceOutput){
		buttonObject.onclick = function(){
			//подстраиваем размеры формы
			adjustFormSize();
			//генерируем последовательность
			originSequence = generateRandomSequence(getRadioParamsValue(document.getElementById('hardlevel')),
				getRadioParamsValue(document.getElementById('sequencetype')));
			//и выводим ее на экран
			sequenceOutput.value = originSequence;
			//запускаем обратный отсчет
			countdown();
			//удаляем переключатели уровня сложности и типа последовательности
			removeElement('hardlevel');
			removeElement('sequencetype');
			//блокруем кнопку генератора
			blockGenerator();
		}
	}

	//функция подготовки кнопки проверки пользовательского ввода
	function prepareCheckButton(checkButtonObject){
		checkButtonObject.onclick = function(){
			//привязываемся к полю ввода
			var inputSequence = getSequenceField('input');
			//если оно существует, проверяем введенную пользователем строку
			if(checkForExistance(inputSequence)){
				//если она совпадает с исходной, то поздравляем с победой
				if(originSequence === inputSequence.value){
					clearPreviousMessages();
					Notify('wining');
				}
				//в противном случае советуем попробовать еще раз
				else{
					clearPreviousMessages();
					Notify('error');
				} 	
			}
		}
	}

	//функция, возвращающая либо объект поля с классом sequenceTypeClass,
	//либо -1 при отсутствии такового
	function getSequenceField(sequenceTypeClass){
		var inputs = document.getElementById('io').getElementsByTagName("input");
		for(var i = 0, j = inputs.length; i < j; i++){
			if(inputs[i].className === ('sequence ' + sequenceTypeClass)){
				return inputs[i];
			}
		}
		return -1;
	}

	//функция, генерирующая случайную последовательность
	function generateRandomSequence(difficulty,sequenceType){

		//определим границу для чисел в заданном алфавите
		var aplhabetNumBound = 9;
		//и проделаем то же самое для букв
		//левая граница
		var alphabetAlphaLeftBoundary = 10;
		//правая
		var alphabetAlphaRightBoundary = 32;
		//исходная последовательность представлет собой пустую строку
		var sequence = '';
		//флаг перевода выбранного символа для буквенной и число-буквенной последовательности
		//в верхний регистр
		var toUpperCase = false;
		
		//генерируем последовательность в зависимости от ее типа
		//и выбранного уровня сложности
		switch(sequenceType){
			
			//для случая числовой последовательности
			case 'numeric':
				for(var i = 0, j = difficlultyLevel[difficulty]['sequenceLength']; i < j; i++){
					sequence += alphabet[Math.round(Math.random() * aplhabetNumBound)];
				}
				break;

			//для случая буквенной последовательности
			case 'alphabetical':
				
				for(var i = 0, j = difficlultyLevel[difficulty]['sequenceLength']; i < j; i++){
					
					toUpperCase = Math.round(Math.random()) ? true : false;

					if(toUpperCase){
						sequence += alphabet[Math.round(Math.random() * (alphabetAlphaRightBoundary - alphabetAlphaLeftBoundary)) + alphabetAlphaLeftBoundary].toUpperCase();
					}
					else{
						sequence += alphabet[Math.round(Math.random() * (alphabetAlphaRightBoundary - alphabetAlphaLeftBoundary)) + alphabetAlphaLeftBoundary];	
					}
				}
				break;

			//для случая число-буквенной последовательности
			case 'alphanumeric':
				
				for(var i = 0, j = difficlultyLevel[difficulty]['sequenceLength']; i < j; i++){
	
					var sequenceSymbol = alphabet[Math.round(Math.random() * alphabetAlphaRightBoundary)];

					switch (typeof(sequenceSymbol)){
						case 'string':
							toUpperCase = Math.round(Math.random()) ? true : false;
							if(toUpperCase){
								sequence += sequenceSymbol.toUpperCase();
								break;		
							}
						case 'number':
							sequence += sequenceSymbol;	 	
					}
			}
		}
		return sequence;
	}


	//функция, блокирующая ввод в поле, представленное объектом inputFieldObject
	function blockInput(inputFieldObject){
		inputFieldObject.onfocus = function(){
			this.blur();
		}
	}

	//функция подготовки таймера
	function prepareTimer(){
		//привязываемся к таймеру
		var canvas = document.getElementById('timer');
		//задаем его размеры
		canvas.width = 200;
		canvas.height = 200;
		//указываем цвет заливки и обводки
		var ctxt = canvas.getContext('2d');
		ctxt.fillStyle = '#9DEC8A';
		ctxt.strokeStyle = 'black';
		//отрисовываем таймер
		ctxt.beginPath();
		ctxt.arc(timer.x,timer.y,timer.radius,0,2*Math.PI);
		ctxt.closePath();
		ctxt.fill();
		ctxt.stroke();
	}

	//обработчик для кнопки новой игры,
	//перезагружающий страницу в браузере
	function prepareNewGame(){
		document.getElementById('newgame').onclick = function(){
			window.location.reload();
		}
	}

	//главная функция
	function main(){
		//привязываемся к полю вывода
		var sequenceOutput = getSequenceField('output');
		//привязываемся к кнопке генерации последовательности
		var buttonGenerator = getGeneratorButton();
		//привязываемся к кнопке проверки введенного пользователем ответа
		var checkButton = getCheckButton();
		//блокируем вывод для изменения значения
		blockInput(sequenceOutput);
		//подготавливаем кнопку генерации последовательности
		prepareGenerateButton(buttonGenerator,sequenceOutput);
		//подготавливаем кнопку проверки результата
		prepareCheckButton(checkButton);
		//подготавливаем таймер
		prepareTimer();
	}

	//инициируем запуск игры
	main();
}
