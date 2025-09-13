package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random

class PaymentApiSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://payment-api:3000")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling Load Test")

  // Headers para autenticação
  val authHeaders = Map(
    "Authorization" -> "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZW1wLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQHRlY2hjb3JwLmNvbSIsInJvbGUiOiJ1c2VyIiwidGVuYW50SWQiOiJmOGUyODUwOC1lNDRlLTRkNWUtOWIzYy0yM2UzMjdmZTAxYWYiLCJleHAiOjE3NTc4ODU4NTQsImlhdCI6MTc1Nzc5OTQ1NH0.faO1x7kEd6BslBWAsMJfKlSlCCDn7596dStVPWl94wc"
  )

  // Cenário de teste para endpoints de pagamentos
  val paymentScenario = scenario("Payment API Load Test")
    .exec(
      http("Health Check")
        .get("/health")
        .check(status.is(200))
        .check(jsonPath("$.status").is("ok"))
    )
    .pause(1)
    .exec(
      http("List Payments")
        .get("/api/v1/payments")
        .queryParam("page", "1")
        .queryParam("limit", "20")
        .headers(authHeaders)
        .check(status.is(200))
        .check(jsonPath("$.success").is(true))
    )
    .pause(2)
    .exec(
      http("List Transactions")
        .get("/api/v1/transactions")
        .queryParam("page", "1")
        .queryParam("limit", "20")
        .headers(authHeaders)
        .check(status.is(200))
        .check(jsonPath("$.success").is(true))
    )
    .pause(2)
    .exec(
      http("Payment Analytics")
        .get("/api/v1/payments/analytics")
        .headers(authHeaders)
        .check(status.is(200))
        .check(jsonPath("$.success").is(true))
    )
    .pause(3)
    .exec(
      http("Transaction Analytics")
        .get("/api/v1/transactions/analytics")
        .headers(authHeaders)
        .check(status.is(200))
        .check(jsonPath("$.success").is(true))
    )
    .pause(2)
    .exec(
      http("List Tenants")
        .get("/api/v1/tenants")
        .queryParam("page", "1")
        .queryParam("limit", "10")
        .headers(authHeaders)
        .check(status.is(200))
        .check(jsonPath("$.success").is(true))
    )

  // Cenário de teste para autenticação
  val authScenario = scenario("Authentication Load Test")
    .exec(
      http("Login")
        .post("/api/v1/auth/login")
        .body(StringBody("""{
          "email": "admin@techcorp.com",
          "password": "123456",
          "tenantId": "f8e28508-e44e-4d5e-9b3c-23e327fe01af"
        }"""))
        .check(status.is(200))
        .check(jsonPath("$.success").is(true))
        .check(jsonPath("$.data.tokens.accessToken").exists)
    )

  // Cenário de teste para stress test
  val stressScenario = scenario("Stress Test")
    .exec(
      http("Concurrent Payments List")
        .get("/api/v1/payments")
        .queryParam("page", "1")
        .queryParam("limit", "50")
        .headers(authHeaders)
        .check(status.is(200))
    )
    .pause(1)
    .exec(
      http("Concurrent Transactions List")
        .get("/api/v1/transactions")
        .queryParam("page", "1")
        .queryParam("limit", "50")
        .headers(authHeaders)
        .check(status.is(200))
    )

  // Configuração dos cenários de teste
  setUp(
    // Teste de carga normal
    paymentScenario.inject(
      rampUsers(10).during(30.seconds),
      constantUsers(20).during(2.minutes),
      rampUsers(0).during(30.seconds)
    ),
    
    // Teste de autenticação
    authScenario.inject(
      rampUsers(5).during(10.seconds),
      constantUsers(10).during(1.minute),
      rampUsers(0).during(10.seconds)
    ),
    
    // Teste de stress
    stressScenario.inject(
      rampUsers(50).during(1.minute),
      constantUsers(100).during(3.minutes),
      rampUsers(0).during(1.minute)
    )
  ).protocols(httpProtocol)
   .assertions(
     global.responseTime.max.lt(5000), // Tempo máximo de resposta < 5s
     global.responseTime.mean.lt(1000), // Tempo médio de resposta < 1s
     global.successfulRequests.percent.gt(95) // Taxa de sucesso > 95%
   )
}
