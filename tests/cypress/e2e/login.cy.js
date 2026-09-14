//funcionalidade
describe("Login de usuário", () => {
    //cenario 1
    it("Login com sucesso", () => {
        //Abrir url
        cy.visit("http://localhost:8888/")
        cy.wait(5000)
        
        //Preencher usuario
        cy.get('#login-user').type('admin')

        //Preencher senha   
        cy.get('#login-pass').type('Admin@2026')

        //clicar no botão de login
        cy.get('#form-login > .btn').click()
        //Validar que o login foi realizado com sucesso
        //cy.wait(5000)

        //cy.get('tbody > :nth-child(1) > :nth-child(3) > .btn')
        cy.get('tbody > :nth-child(2) > :nth-child(1)').should('have.text', 'PC Gamer RTX 4060').should('be.visible')
        cy.wait(5000)

    })

    //cenario 2
    it("Login senha invalida", () => {
        cy.visit("http://localhost:8888/")
        cy.get('#login-user').type('admin')
        cy.get('#login-pass').type('InvalidPassword')
        cy.wait(2000)
        cy.get('#form-login > .btn').click()
        cy.get('#tela-login > .card > h2').should('have.text', 'Acesso ao Sistema').should('be.visible')
        cy.wait(2000)
    })

    //cenario 3
    it("Login usuario invalido", () => {
        cy.visit("http://localhost:8888/")
        cy.get('#login-user').type('invaliduser')
        cy.get('#login-pass').type('Admin@2026')
        cy.wait(2000)
        cy.get('#form-login > .btn').click()
        cy.get('#tela-login > .card > h2').should('have.text', 'Acesso ao Sistema').should('be.visible')
        cy.wait(2000)

    })

    it("usuario e senha vazios", () => {
        cy.visit("http://localhost:8888/")
        cy.get('#form-login > .btn').click()
        cy.get('#tela-login > .card > h2').should('have.text', 'Acesso ao Sistema').should('be.visible')
        cy.wait(5000)

    })

    it("Usuario vazio ", () => {
        cy.visit("http://localhost:8888/")
        cy.get('#login-pass').type('Admin@2026')
        cy.get('#form-login > .btn').click()
        cy.get('#tela-login > .card > h2').should('have.text', 'Acesso ao Sistema').should('be.visible')
        cy.wait(5000)
    })

    it("Senha vazia", ()=> {
        cy.visit('http://localhost:8888')
        cy.get('#login-user').type('admin')
        cy.get('#form-login > .btn').click()
        cy.get('#tela-login > .card > h2').should('have.text', 'Acesso ao Sistema').should('be.visible')
        cy.wait(5000)
    })



})