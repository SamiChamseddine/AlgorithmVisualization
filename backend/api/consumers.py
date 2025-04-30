import asyncio
import random
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .utils.polynomial_fit import polynomial_fit



import numpy as np
from scipy.optimize import curve_fit

class FittingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.dataset = {"x": [], "y": []}
        self.fitting_task = None
        self.fitting_result = None

    async def disconnect(self, close_code):
        print(f"Disconnected with code: {close_code}")
        if self.fitting_task and not self.fitting_task.done():
            self.fitting_task.cancel()

    async def receive(self, text_data):
        data = json.loads(text_data)

        if "action" in data:
            if data["action"] == "generate_dataset":
                function_type = data.get("function_type", "sin")
                x = np.linspace(0, 100, 50)

                if function_type == "sin":
                    y = 20 * np.sin(np.pi * 0.04 * x) + np.random.rand(50) * 10
                elif function_type == "linear":
                    y = 2 * x + 10 + np.random.normal(0, 5, size=len(x))
                elif function_type == "quadratic":
                    y = 0.05 * x**2 - 3 * x + 20 + np.random.normal(0, 10, size=len(x))
                elif function_type == "exponential":
                    y = 10 * np.exp(0.03 * x) + np.random.normal(0, 20, size=len(x))
                elif function_type == "logarithmic":
                    y = 10 * np.log(x + 1) + np.random.normal(0, 2, size=len(x))
                else:
                    await self.send(json.dumps({"error": f"Unknown function type: {function_type}"}))
                    return

                self.dataset = {"x": x.tolist(), "y": y.tolist()}
                await self.send(json.dumps({"dataset": self.dataset}))


            elif data["action"] == "start_fitting":
                method = data.get("method")
                degree = data.get("degree", 1)
                delay = data.get("delay", 0.1)

                if self.fitting_task and not self.fitting_task.done():
                    self.fitting_task.cancel()
                print(f"method: {method}")
                self.fitting_task = asyncio.create_task(
                    self.perform_fit(self.dataset, method, degree, delay)
                )

            elif data["action"] == "reset":
                if self.fitting_task and not self.fitting_task.done():
                    self.fitting_task.cancel()
                    self.fitting_task = None
                self.dataset = {"x": [], "y": []}
                self.fitting_result = None
                await self.send(json.dumps({"message": "Dataset reset"}))

    async def perform_fit(self, dataset, method, degree, delay):
        fitting_methods = {
            "polynomial": polynomial_fit,
        }

        fit_function = fitting_methods.get(method)
        if not fit_function:
            await self.send(json.dumps({"error": f"Unknown fitting method: {method}"}))
            return

        try:
            final_coefficients = await fit_function(
                dataset, degree, self.send_fit_data, delay
            )

            if final_coefficients is not None:
                self.fitting_result = final_coefficients
                await self.send(
                    json.dumps(
                        {"isFitted": True, "coefficients": final_coefficients.tolist()}
                    )
                )
            else:
                await self.send(
                    json.dumps(
                        {"error": "Fitting process failed, no coefficients returned"}
                    )
                )

        except asyncio.CancelledError:
            await self.send(json.dumps({"message": "Fitting process cancelled"}))

    async def send_fit_data(self, progress, coefficients, mse, r_squared):
        await self.send(
            json.dumps(
                {
                    "progress": progress,
                    "coefficients": coefficients,
                    "mse": mse,
                    "r_squared": r_squared,
                }
            )
        )
