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
    .check(status.in(200, 401, 422))

  // Dados de usuários para login
  val users = csv("data/users.csv").circular

  // Cenário 1: Health Check - Teste básico de conectividade
  val healthCheckScenario = scenario("Health Check Scenario")
    .exec(
      http("Health Check")
        .get("/health")
        .check(status.is(200))
    )

  // Cenário 2: Login e operações autenticadas
  val authenticatedScenario = scenario("Authenticated Scenario")
    .feed(users)
    .exec(
      http("Login Request")
        .post("/api/v1/auth/login")
        .body(StringBody(s"""{"email": "${"$"}{email}", "password": "${"$"}{password}", "tenantId": "${"$"}{tenantId}"}"""))
        .check(status.in(200, 401, 422))
        .check(jsonPath("$.data.tokens.accessToken").optional.saveAs("accessToken"))
    )
    .pause(1.second)
    .doIf(session => session("accessToken").asOption[String].isDefined) {
      exec(
        http("Get User Info")
          .get("/api/v1/auth/me")
          .header("Authorization", "Bearer ${accessToken}")
          .check(status.is(200))
      )
      .pause(1.second)
      .exec(
        http("Get Payments")
          .get("/api/v1/payments")
          .header("Authorization", "Bearer ${accessToken}")
          .check(status.in(200, 401))
      )
      .pause(1.second)
      .exec(
        http("Get Transactions")
          .get("/api/v1/transactions")
          .header("Authorization", "Bearer ${accessToken}")
          .check(status.in(200, 401))
      )
    }

  // Cenário 3: Teste de endpoints sem autenticação
  val unauthenticatedScenario = scenario("Unauthenticated Scenario")
    .exec(
      http("Get User Info Without Auth")
        .get("/api/v1/auth/me")
        .check(status.is(200))
    )
    .pause(1.second)
    .exec(
      http("Get Payments Without Auth")
        .get("/api/v1/payments")
        .check(status.in(200, 401))
    )
    .pause(1.second)
    .exec(
      http("Get Transactions Without Auth")
        .get("/api/v1/transactions")
        .check(status.in(200, 401))
    )

  // Cenário 4: Mixed Load - Cenário misto com todos os endpoints
  val mixedLoadScenario = scenario("Mixed Load Scenario")
    .randomSwitch(
      30.0 -> exec(healthCheckScenario),
      40.0 -> exec(authenticatedScenario),
      30.0 -> exec(unauthenticatedScenario)
    )

  // Configuração dos cenários de teste
  setUp(
    // Teste de aquecimento - 5 usuários por 30 segundos
    healthCheckScenario.inject(
      rampUsers(5).during(30.seconds)
    ).protocols(httpProtocol),

    // Teste de carga normal - 30 usuários por 2 minutos
    mixedLoadScenario.inject(
      rampUsers(30).during(2.minutes)
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
