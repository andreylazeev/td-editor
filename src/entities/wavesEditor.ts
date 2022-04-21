import { makeid } from '../utils';

export class WavesEditor {
  private _createButton: HTMLButtonElement;
  private _createWaveButton: HTMLButtonElement;
  private _wavesItems: HTMLSpanElement[] = [];
  private _saveButton: HTMLButtonElement;
  private _header: HTMLDivElement;
  private _content: HTMLDivElement;
  private _footer: HTMLDivElement;
  private _enemies: HTMLDivElement;
  private _enemiesPreview: HTMLDivElement;
  private _enemiesImages: NodeListOf<HTMLImageElement>;
  private _enemiesSelects: NodeListOf<HTMLSelectElement>;
  private _enemiesRemoves: NodeListOf<HTMLDivElement>;
  private _enemiesQueue: string[] = [];
  private _enemiesItems: { id: number; name: string }[] = [];
  private _waves: Record<string, any> = { 0: [] };
  private _waveIndex = 0;
  private _currentWaveIndex = 0;
  private _wavesBlock: HTMLDivElement;

  public onEnemyAdd: (enemies: any) => any | null = null;

  private _allEnemies: Record<
    string,
    { types: { id: number; name: string }[]; id: string; path: undefined | string; wave: number | undefined }
  > = {};

  public updatePaths = (paths: any) => {
    if (paths.length === paths.length) {
      this._paths = paths;
      this.updateItems('without_html');
    }
    if (paths.length >= this._paths.length) {
      this._paths = paths;
      this.updateItems();
      console.log(this._paths);
    }
  };

  private _toggleEditor = () => {
    this._enemies.classList.toggle('hidden');
    this._createButton.classList.toggle('hidden');
  };

  private _updatePreview = () => {
    this._enemiesPreview.innerHTML = this._enemiesQueue.join(', ');
  };

  private _toggleSelect = (event: any) => {
    const value = JSON.parse('[' + event.target.value.replaceAll("'", '"') + ']');

    this._allEnemies[value[1]].path = value[0].toString();

    // console.log(this._allEnemies);
  };

  private updateItems = (type?: string) => {
    if (this._enemiesItems.length > 0) {
      const id = makeid(6);
      this._allEnemies = { ...this._allEnemies, [id]: { types: this._enemiesItems, id, path: undefined, wave: this._currentWaveIndex } };
      this._enemiesQueue = [];
      this._enemiesItems = [];
    }
    this._updatePreview();
    // this._content.childNodes.forEach((node) => {
    //   this._content.removeChild(node);
    // });
    if (Object.values(this._allEnemies).length > 0 && type !== 'without_html') {
      this._content.innerHTML = '';
      this._content.insertAdjacentElement('afterbegin', this._wavesBlock);
      this._content.insertAdjacentHTML(
        'beforeend',
        `
          ${Object.values(this._allEnemies)
            .map((enemy, index) => {
              if (this._paths.length) {
                Object.keys(this._allEnemies).forEach((id) => {
                  if (!this._allEnemies[id].path) {
                    this._allEnemies[id].path = `${this._paths[0]}`;
                  }
                });
              }

              if (Number(enemy.wave) === Number(this._currentWaveIndex)) {
                return `<div class="waves__content--item"><p>${enemy.types.map((el) => el.name).join(', ')}</p>${
                  this._paths.length
                    ? `<p>Волна</p><select value="${enemy.path}">${this._paths
                        .map(
                          (path: any) => `<option value="${path}, '${enemy.id}'" ${path === enemy.path ? 'selected' : ''}>${path}</option>`,
                        )
                        .join('')}</select><div class="remove" data-remove="${enemy.id}">удалить</div>`
                    : ''
                }</div>`;
              }
            })
            .join('')}
      `,
      );
      this._updateContent();
    }

    this._enemiesSelects = this._content.querySelectorAll('select');
    this._enemiesSelects.forEach((select) => {
      select.onchange = this._toggleSelect;
    });
    this._enemiesRemoves = this._content.querySelectorAll('.remove');
    this._enemiesRemoves.forEach((remove) => {
      remove.onclick = () => {
        const id = remove.dataset.remove;
        delete this._allEnemies[id];
        this._waves = Object.values(this._waves).map((waves) => {
          return waves.filter((wave: any) => wave.id !== id);
        });
        console.log(this._waves);

        this.updateItems();
      };
    });
    Object.values(this._allEnemies).forEach((value: any, index: number) => {
      if (!this._waves[value.wave]) {
        this._waves[value.wave] = [];
      } else {
        if (!this._waves[value.wave].some((el: any) => el.id === value.id)) {
          this._waves[value.wave].push(value);
        }
      }
    });
    this.onEnemyAdd(this._waves);
  };

  private _updateContent = () => {
    this._wavesBlock.innerHTML = '';
    Object.entries(this._waves).forEach((el) => {
      let elem = document.createElement('span');
      elem.dataset.type = el[0];
      elem.innerHTML = el[0];
      if (el[0] === this._currentWaveIndex.toString()) {
        elem.classList.add('active');
      }
      this._wavesBlock.insertAdjacentElement('beforeend', elem);
      elem.onclick = (e: any) => {
        this._selectWave(e.target.dataset.type);
        this.updateItems();
      };
    });
  };

  private _selectWave = (type: number) => {
    this._currentWaveIndex = type;
    this._updateContent();
  };

  constructor(private _editor: HTMLElement, private _paths: any) {
    this._createButton = this._editor.querySelector('#create_enemies');
    this._createWaveButton = this._editor.querySelector('#create_wave');
    this._saveButton = this._editor.querySelector('#save_enemies');
    this._header = this._editor.querySelector('.waves__header');
    this._content = this._editor.querySelector('.waves__content');
    this._enemiesPreview = this._editor.querySelector('.waves__enemies--preview');
    this._enemiesImages = this._editor.querySelectorAll('.waves__enemies img');

    this._wavesBlock = document.createElement('div');
    this._wavesBlock.className = 'waves__nav';

    Object.entries(this._waves).forEach((el) => {
      let elem = document.createElement('span');
      elem.dataset.type = el[0];
      elem.innerHTML = el[0];
      elem.classList.add('active');
      this._wavesBlock.insertAdjacentElement('beforeend', elem);

      elem.onclick = (e: any) => {
        this._selectWave(e.target.dataset.type);
        this.updateItems();
      };
    });

    this._content.appendChild(this._wavesBlock);

    console.log(Object.entries(this._waves).map((el) => ({ id: el[0], enemies: el[1] })));

    this._enemiesImages.forEach((enemy) => {
      enemy.onclick = () => {
        this._enemiesQueue.push(enemy.dataset.name);
        this._enemiesItems.push({ id: Number(enemy.dataset.type), name: enemy.dataset.name });
        this._updatePreview();
      };
    });

    this._content = this._editor.querySelector('.waves__content');
    this._footer = this._editor.querySelector('.waves__footer');
    this._enemies = this._editor.querySelector('.waves__enemies');

    this._header.onclick = () => {
      this._content.classList.toggle('closed');
      this._footer.classList.toggle('closed');
    };

    this._createButton.onclick = () => {
      this._toggleEditor();
    };
    this._createWaveButton.onclick = () => {
      this._waveIndex += 1;
      this._waves[this._waveIndex] = [];
      this._updateContent();
    };
    this._saveButton.onclick = () => {
      this.updateItems();
      this._toggleEditor();
    };
  }
}
