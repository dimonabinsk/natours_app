/* eslint-disable*/
const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);
const yandexLocationsData = locations.map((el, i) => ({
  type: 'Feature',
  id: i,
  geometry: {
    type: el.type,
    coordinates: [el.coordinates[1], el.coordinates[0]],
  },
  properties: {
    hintContent: el.description,
  },
}));
// Функция ymaps.ready() будет вызвана, когда
// загрузятся все компоненты API, а также когда будет готово DOM-дерево.
// console.log(yandexLocationsData);
function init() {
  // Создание карты.
  const Map = new ymaps.Map('map', {
    // Координаты центра карты.
    // Порядок по умолчанию: «широта, долгота».
    // Чтобы не определять координаты центра карты вручную,
    // воспользуйтесь инструментом Определение координат.
    center: [locations[0].coordinates[1], locations[0].coordinates[0]],
    // Уровень масштабирования. Допустимые значения:
    // от 0 (весь мир) до 19.
    zoom: 7,
    controls: [],
  });

  if (Map) {
    const objectManager = new ymaps.ObjectManager({
      // Чтобы метки начали кластеризоваться, выставляем опцию.
      clusterize: true,
      // ObjectManager принимает те же опции, что и кластеризатор.
      gridSize: 32,
      clusterDisableClickZoom: true,
    });
    // отключаем zoom при scroll колёсиком мыши
    Map.behaviors.disable('scrollZoom');
    // отключаем zoom на сенсоре щипком пальцев
    Map.behaviors.disable('multiTouch');
    // Чтобы задать опции одиночным объектам и кластерам,
    // обратимся к дочерним коллекциям ObjectManager.
    objectManager.objects.options.set('preset', 'islands#greenDotIcon');
    objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
    Map.geoObjects.add(objectManager);
    objectManager.add(yandexLocationsData);

    Map.controls.add('zoomControl', {
      size: 'small',
      float: 'none',
      position: {
        bottom: '70px',
        left: '20px',
      },
    });
  }
}

ymaps.ready(init);
