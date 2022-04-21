export class GridGenerator {
  private _firstInput = document.createElement('input');
  private _secondInput = document.createElement('input');
  private _button = document.createElement('button');
  private _container: HTMLDivElement;

  public onGenerate: (value: any) => any;

  constructor() {
    this._firstInput.placeholder = 'Ш';
    this._secondInput.placeholder = 'В';
    this._button.textContent = 'создать базовую сетку';
    this._container = document.querySelector('#generate_grid');
    this._button.onclick = () => {
      console.log(this._firstInput.value, this._secondInput.value);
      const matrix = [];

      for (let i = 1; i <= Number(this._secondInput.value); i++) {
        let arr = [];
        for (let j = 1; j <= Number(this._firstInput.value); j++) {
          if (i % 2 == j % 2) {
            arr.push(['grass-dark', 'empty']);
          } else {
            arr.push(['grass-light', 'empty']);
          }
        }
        matrix.push(arr);
      }
      this.onGenerate(matrix);
    };
    this._container.insertAdjacentElement('beforeend', this._firstInput);
    this._container.insertAdjacentElement('beforeend', this._secondInput);
    this._container.insertAdjacentElement('beforeend', this._button);
  }
}
