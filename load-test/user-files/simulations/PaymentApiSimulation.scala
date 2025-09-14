package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class PaymentApiSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://payment-api:3000")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling Load Test")

  // Cenário 1: Health Check - Teste básico de conectividade
  val healthCheckScenario = scenario("Health Check Scenario")
    .exec(
      http("Health Check")
        .get("/health")
        .check(status.is(200))
        .check(jsonPath("$.status").is("ok"))
    )

  // Cenário 2: Auth Login - Teste de autenticação
  val authLoginScenario = scenario("Auth Login Scenario")
    .exec(
      http("Login Request")
        .post("/api/v1/auth/login")
        .body(StringBody("""{
          "email": "test@example.com",
          "password": "password123"
        }"""))
        .check(status.in(200, 401, 422)) // Aceita sucesso ou erro de validação
    )

  // Cenário 3: Payments - Teste de listagem de pagamentos
  val paymentsScenario = scenario("Payments Scenario")
    .exec(
      http("Get Payments")
        .get("/api/v1/payments")
        .header("Authorization", "Bearer dummy-token") // Token dummy para teste
        .check(status.in(200, 401)) // Aceita sucesso ou não autorizado
    )

  // Cenário 4: Transactions - Teste de listagem de transações
  val transactionsScenario = scenario("Transactions Scenario")
    .exec(
      http("Get Transactions")
        .get("/api/v1/transactions")
        .header("Authorization", "Bearer dummy-token") // Token dummy para teste
        .check(status.in(200, 401)) // Aceita sucesso ou não autorizado
    )

  // Cenário 5: Auth Me - Teste de endpoint protegido
  val authMeScenario = scenario("Auth Me Scenario")
    .exec(
      http("Get User Info")
        .get("/api/v1/auth/me")
        .header("Authorization", "Bearer dummy-token") // Token dummy para teste
        .check(status.in(200, 401)) // Aceita sucesso ou não autorizado
    )

  // Cenário 6: Mixed Load - Cenário misto com todos os endpoints
  val mixedLoadScenario = scenario("Mixed Load Scenario")
    .randomSwitch(
      30.0 -> exec(healthCheckScenario),
      20.0 -> exec(authLoginScenario),
      20.0 -> exec(paymentsScenario),
      15.0 -> exec(transactionsScenario),
      15.0 -> exec(authMeScenario)
    )

  // Configuração dos cenários de teste
  setUp(
    // Teste de aquecimento - 10 usuários por 30 segundos
    healthCheckScenario.inject(
      rampUsers(10).during(30.seconds)
    ).protocols(httpProtocol),

    // Teste de carga normal - 50 usuários por 2 minutos
    mixedLoadScenario.inject(
      rampUsers(50).during(2.minutes)
    ).protocols(httpProtocol)
  )
  .assertions(
    // Assertions para validar performance
    global.responseTime.max.lt(5000), // Tempo máximo de resposta < 5s
    global.responseTime.mean.lt(1000), // Tempo médio de resposta < 1s
    global.successfulRequests.percent.gt(95.0) // Taxa de sucesso > 95%
  )
  .maxDuration(5.minutes) // Duração máxima do teste
}
