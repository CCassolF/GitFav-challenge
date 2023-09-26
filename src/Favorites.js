import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Already registered user.')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error("User not found!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter((entry) => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('.content-table tbody')

    this.update()
    this.onaad()
  }

  onaad() {
    const addButton = this.root.querySelector('.input-wrapper button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.input-wrapper input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    if(this.entries == 0) {
      this.tbody.innerHTML = `
        <tr class="text-table .no-content">
          <th class="not-content-table">
            <img src="./assets/star.svg" alt="Star">
            No favorites yet
          </th>
        </tr>
      `
    }

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.first-column img').src = `https://github.com/${user.login}.png`
      row.querySelector('.first-column img').alt = `${user.name} image`
      row.querySelector('.first-column span').textContent = user.name
      row.querySelector('.first-column small').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')

        if(isOk) {
          this.delete(user)
        }
      }
      
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML= `
      <td>
        <div class="first-column">
          <img src="https://github.com/ccassolf.png" alt="Profile Image">

          <div class="first-column-info">
            <span>Carlos Cassol</span>
            <small>/ccassolf</small>
          </div>
        </div>
      </td>
      <td class="repositories">123</td>
      <td class="followers">1234</td>
      <td>
        <button class="remove">
          Remove
        </button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }
}