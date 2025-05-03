"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  filterData,
  getAllRegions,
  getTopWasteCountries,
} from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiCoffee,
  FiHome,
  FiMaximize2,
  FiMessageSquare,
  FiMinimize2,
  FiSend,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

type WasteType = "combined" | "household" | "retail" | "foodService";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface ChatBotProps {
  data: FoodWasteData[];
  onSelectCountry: (country: string) => void;
  onSelectRegion: (region: string | null) => void;
  onSelectTab: (tab: string) => void;
  onSelectWasteType?: (wasteType: WasteType) => void;
}

export function ChatBot({
  data,
  onSelectCountry,
  onSelectRegion,
  onSelectTab,
  onSelectWasteType,
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        'Hello! I\'m your Food Waste Data Assistant. You can ask me questions about the data, request statistics, or help navigating the dashboard. For example:\n\n- "What are the top 5 countries with highest food waste?"\n- "Tell me about food waste in Europe"\n- "How does the US compare to China?"\n- "Show me the trends tab"\n- "Show only household waste"',
    },
  ]);

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Process the user query
    setTimeout(() => {
      const response = generateResponse(input, data);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: response.message },
      ]);
      setIsProcessing(false);

      // Handle navigation actions if needed
      if (response.action === "selectCountry" && response.value) {
        onSelectCountry(response.value);
      } else if (response.action === "selectRegion" && response.value) {
        onSelectRegion(response.value);
      } else if (response.action === "selectTab" && response.value) {
        onSelectTab(response.value);
      } else if (
        response.action === "selectWasteType" &&
        response.value &&
        onSelectWasteType
      ) {
        onSelectWasteType(response.value as WasteType);
      }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Sheet>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-[hsl(var(--chat-bot-bg))] hover:bg-[hsl(var(--chat-bot-bg))] hover:opacity-90"
            aria-label="Open chat assistant"
          >
            <FiMessageSquare className="h-5 w-5 text-white" />
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent className="w-[90vw] sm:max-w-md p-0 flex flex-col h-[80vh] sm:h-full border-l-4 border-[hsl(var(--chat-bot-bg))]">
        <SheetHeader className="p-4 border-b bg-[hsl(var(--chat-bot-bg))] text-white">
          <SheetTitle className="text-white">
            Food Waste Data Assistant
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-sky-50 to-white">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "chat-bot-message"
                }`}
              >
                <div
                  className="prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: marked(message.content, { breaks: true }),
                  }}
                />
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-[hsl(var(--chat-bot-bg))] text-white shadow-sm">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t flex gap-2 bg-white"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about food waste data..."
            className="flex-1 min-h-10 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chat-bot-bg))]"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-[hsl(var(--chat-bot-bg))] hover:bg-[hsl(var(--chat-bot-bg))] hover:opacity-90"
            disabled={!input.trim() || isProcessing}
          >
            <FiSend className="h-4 w-4 text-white" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface ResponseResult {
  message: string;
  action?: "selectCountry" | "selectRegion" | "selectTab" | "selectWasteType";
  value?: string;
}

function generateResponse(
  query: string,
  data: FoodWasteData[],
): ResponseResult {
  const lowerQuery = query.toLowerCase();

  // Waste type filter commands
  if (
    lowerQuery.includes("household waste") ||
    lowerQuery.includes("household only") ||
    lowerQuery.includes("only household") ||
    lowerQuery.match(/\bhousehold\b/)
  ) {
    return {
      message:
        "I've filtered the data to show only **household food waste** per capita. Would you like to see this in the table or chart?",
      action: "selectWasteType",
      value: "household",
    };
  }
  if (
    lowerQuery.includes("retail waste") ||
    lowerQuery.includes("retail only") ||
    lowerQuery.includes("only retail") ||
    lowerQuery.match(/\bretail\b/)
  ) {
    return {
      message:
        "I've filtered the data to show only **retail food waste** per capita. Would you like to see this in the table or chart?",
      action: "selectWasteType",
      value: "retail",
    };
  }
  if (
    lowerQuery.includes("food service waste") ||
    lowerQuery.includes("foodservice waste") ||
    lowerQuery.includes("food service only") ||
    lowerQuery.includes("only food service") ||
    lowerQuery.match(/\bfood service\b/) ||
    lowerQuery.match(/\bfoodservice\b/)
  ) {
    return {
      message:
        "I've filtered the data to show only **food service food waste** per capita. Would you like to see this in the table or chart?",
      action: "selectWasteType",
      value: "foodService",
    };
  }
  if (
    lowerQuery.includes("combined waste") ||
    lowerQuery.includes("all waste") ||
    lowerQuery.includes("total waste") ||
    lowerQuery.includes("reset waste type") ||
    lowerQuery.match(/\bcombined\b/) ||
    lowerQuery.match(/\ball\b/) ||
    lowerQuery.match(/\btotal\b/)
  ) {
    return {
      message:
        "I've reset the filter to show **combined food waste** (household + retail + food service) per capita.",
      action: "selectWasteType",
      value: "combined",
    };
  }

  // Navigation commands
  if (
    lowerQuery.includes("show") ||
    lowerQuery.includes("go to") ||
    lowerQuery.includes("navigate")
  ) {
    if (lowerQuery.includes("trend") || lowerQuery.includes("over time")) {
      return {
        message:
          "I've opened the trends tab for you. Here you can see how food waste has changed over time.",
        action: "selectTab",
        value: "trends",
      };
    } else if (lowerQuery.includes("table") || lowerQuery.includes("detail")) {
      return {
        message:
          "I've opened the data table for you. Here you can see detailed information for all countries.",
        action: "selectTab",
        value: "table",
      };
    } else if (
      lowerQuery.includes("compare") ||
      lowerQuery.includes("comparison")
    ) {
      return {
        message: "I've opened the country comparison tab for you.",
        action: "selectTab",
        value: "compare",
      };
    } else if (
      lowerQuery.includes("overview") ||
      lowerQuery.includes("dashboard")
    ) {
      return {
        message: "I've returned to the main overview for you.",
        action: "selectTab",
        value: "overview",
      };
    }
  }

  // Top countries query
  if (
    lowerQuery.includes("top") &&
    (lowerQuery.includes("country") ||
      lowerQuery.includes("countries") ||
      lowerQuery.includes("highest") ||
      lowerQuery.includes("most"))
  ) {
    // Extract number if present (default to 5)
    const numMatch = lowerQuery.match(/\d+/);
    const num = numMatch ? Number.parseInt(numMatch[0]) : 5;
    const limit = Math.min(num, 10); // Limit to 10 for readability

    const topCountries = getTopWasteCountries(data, limit);

    let response = `# Top ${limit} Countries with Highest Food Waste\n\n`;
    topCountries.forEach((country, index) => {
      response += `${index + 1}. **${country.country}**: ${country.combinedFigures} kg/capita/year\n`;
    });

    return {
      message: response,
    };
  }

  // Specific country query
  const countryMatch = data.find((item) =>
    lowerQuery.includes(item.country.toLowerCase()),
  );

  if (countryMatch) {
    const householdPct = (
      (countryMatch.householdEstimatePerCapita / countryMatch.combinedFigures) *
      100
    ).toFixed(1);
    const retailPct = (
      (countryMatch.retailEstimatePerCapita / countryMatch.combinedFigures) *
      100
    ).toFixed(1);
    const foodServicePct = (
      (countryMatch.foodServiceEstimatePerCapita /
        countryMatch.combinedFigures) *
      100
    ).toFixed(1);

    return {
      message:
        `# Food Waste in ${countryMatch.country}\n\n` +
        `- **Total Waste**: ${countryMatch.combinedFigures} kg/capita/year\n` +
        `- **Household Waste**: ${countryMatch.householdEstimatePerCapita} kg/capita/year (${householdPct}%)\n` +
        `- **Retail Waste**: ${countryMatch.retailEstimatePerCapita} kg/capita/year (${retailPct}%)\n` +
        `- **Food Service Waste**: ${countryMatch.foodServiceEstimatePerCapita} kg/capita/year (${foodServicePct}%)\n` +
        `- **Region**: ${countryMatch.region}\n` +
        `- **Confidence Level**: ${countryMatch.confidenceInEstimate}\n\n` +
        `Would you like to see this country in the data table?`,
      action: "selectCountry",
      value: countryMatch.country,
    };
  }

  // Specific region query
  const regions = getAllRegions(data);
  const regionMatch = regions.find((region) =>
    lowerQuery.includes(region.toLowerCase()),
  );

  if (regionMatch) {
    const regionalData = filterData(data, { region: regionMatch });
    const average =
      regionalData.reduce((sum, item) => sum + item.combinedFigures, 0) /
      regionalData.length;
    const highestCountry = regionalData.sort(
      (a, b) => b.combinedFigures - a.combinedFigures,
    )[0];

    return {
      message:
        `# Food Waste in ${regionMatch}\n\n` +
        `- **Average Waste**: ${average.toFixed(1)} kg/capita/year\n` +
        `- **Number of Countries**: ${regionalData.length}\n` +
        `- **Highest Waste Country**: ${highestCountry.country} (${highestCountry.combinedFigures} kg/capita/year)\n\n` +
        `I've applied a filter to show only countries in ${regionMatch}.`,
      action: "selectRegion",
      value: regionMatch,
    };
  }

  // Add more complex handling for food waste impact queries
  if (
    lowerQuery.includes("impact") ||
    lowerQuery.includes("effect") ||
    lowerQuery.includes("consequence") ||
    lowerQuery.includes("result") ||
    lowerQuery.includes("climate") ||
    lowerQuery.includes("environment") ||
    lowerQuery.includes("environmental")
  ) {
    return {
      message:
        "# Environmental Impact of Food Waste\n\n" +
        "Food waste has several significant environmental impacts:\n\n" +
        "- **Greenhouse Gas Emissions**: When food decomposes in landfills, it produces methane, a potent greenhouse gas.\n" +
        "- **Resource Waste**: Wasted food means wasted water, land, energy, labor, and other resources used in production.\n" +
        "- **Biodiversity Loss**: Agriculture expansion to produce food that ends up wasted contributes to habitat destruction.\n" +
        "- **Water Footprint**: Food production requires significant water resources.\n\n" +
        "According to research, if food waste were a country, it would be the third-largest greenhouse gas emitter after China and the United States.",
    };
  }

  // Add pattern matching for waste reduction queries
  if (
    lowerQuery.includes("reduce") ||
    lowerQuery.includes("solution") ||
    lowerQuery.includes("prevent") ||
    lowerQuery.includes("avoid") ||
    lowerQuery.includes("mitigate") ||
    lowerQuery.includes("decrease") ||
    lowerQuery.includes("lower") ||
    lowerQuery.includes("cutting") ||
    lowerQuery.includes("cut")
  ) {
    if (lowerQuery.includes("food waste") || lowerQuery.includes("waste")) {
      return {
        message:
          "# Food Waste Reduction Strategies\n\n" +
          "Food waste can be reduced through various strategies:\n\n" +
          "- **Consumer Education**: Raising awareness about proper food storage and meal planning\n" +
          "- **Improved Supply Chain**: Better inventory management and cold chain logistics\n" +
          "- **Food Recovery Programs**: Donating excess food to food banks and shelters\n" +
          "- **Standardized Date Labeling**: Clearer expiration and best-by dates\n" +
          "- **Government Policies**: Regulations and incentives to reduce waste\n" +
          "- **Composting**: Proper disposal of unavoidable food waste\n\n" +
          "Would you like more specific information about any of these approaches?",
      };
    }
  }

  // Add support for advanced analysis requests
  if (
    lowerQuery.includes("analyze") ||
    lowerQuery.includes("analysis") ||
    lowerQuery.includes("correlation") ||
    lowerQuery.includes("relationship") ||
    lowerQuery.includes("pattern") ||
    lowerQuery.includes("trend")
  ) {
    if (lowerQuery.includes("region")) {
      return {
        message:
          "# Regional Analysis of Food Waste\n\n" +
          "Looking at regional patterns in food waste data:\n\n" +
          "- **Europe**: Generally has higher household waste, with Northern European countries showing better waste management than Southern European countries\n" +
          "- **North America**: High per capita waste across household, retail, and food service sectors\n" +
          "- **Asia**: Varies widely between developed and developing countries\n" +
          "- **Africa**: Generally lower per capita waste but higher post-harvest losses\n\n" +
          "I've opened the overview tab to show regional charts. You can also use the Region filter to explore specific regions.",
        action: "selectTab",
        value: "overview",
      };
    }

    if (
      lowerQuery.includes("income") ||
      lowerQuery.includes("wealth") ||
      lowerQuery.includes("gdp") ||
      lowerQuery.includes("economy")
    ) {
      return {
        message:
          "# Food Waste and Economic Development\n\n" +
          "There's a notable correlation between a country's economic development and its food waste patterns:\n\n" +
          "- **High-income countries**: Tend to have higher consumer waste (household and food service)\n" +
          "- **Middle-income countries**: Often have higher retail waste due to developing infrastructure\n" +
          "- **Low-income countries**: Generally have lower consumer waste but higher production/supply chain losses\n\n" +
          "This suggests that as countries develop economically, the location of food waste shifts from early supply chain to consumer level.",
      };
    }
  }

  // Add support for comparing waste types
  if (
    lowerQuery.includes("compare") &&
    (lowerQuery.includes("household") ||
      lowerQuery.includes("retail") ||
      lowerQuery.includes("food service") ||
      lowerQuery.includes("types") ||
      lowerQuery.includes("sources"))
  ) {
    return {
      message:
        "# Comparison of Food Waste Sources\n\n" +
        "Based on the global data:\n\n" +
        "- **Household waste** is typically the largest contributor to food waste in most countries (about 60-70% of total waste)\n" +
        "- **Food service waste** varies significantly by country's eating habits and restaurant sector size\n" +
        "- **Retail waste** is generally the smallest component but still significant\n\n" +
        "I've set up the waste type filter to help you compare these different sources. You can switch between them to see how the data changes.",
    };
  }

  // Comparison queries
  if (
    lowerQuery.includes("compare") ||
    lowerQuery.includes("comparison") ||
    lowerQuery.includes("versus") ||
    lowerQuery.includes("vs")
  ) {
    return {
      message:
        "To compare countries, I've opened the comparison tab. You can select multiple countries and see how they compare.",
      action: "selectTab",
      value: "compare",
    };
  }

  // Global statistics
  if (
    lowerQuery.includes("global") ||
    lowerQuery.includes("world") ||
    lowerQuery.includes("average") ||
    lowerQuery.includes("overall")
  ) {
    const avg =
      data.reduce((sum, item) => sum + item.combinedFigures, 0) / data.length;
    const highest = getTopWasteCountries(data, 1)[0];
    const lowest = [...data].sort(
      (a, b) => a.combinedFigures - b.combinedFigures,
    )[0];

    return {
      message:
        `# Global Food Waste Statistics\n\n` +
        `- **Global Average**: ${avg.toFixed(1)} kg/capita/year\n` +
        `- **Total Countries**: ${data.length}\n` +
        `- **Highest Waste**: ${highest.country} (${highest.combinedFigures} kg/capita/year)\n` +
        `- **Lowest Waste**: ${lowest.country} (${lowest.combinedFigures} kg/capita/year)\n\n` +
        `What else would you like to know about global food waste?`,
    };
  }

  // Fallback response
  return {
    message:
      "I'm not sure how to answer that question about food waste data. You can ask me about specific countries, regions, or for general statistics. Here are some examples:\n\n" +
      "- What are the top 5 countries with highest food waste?\n" +
      "- Tell me about food waste in Western Europe\n" +
      "- How much food waste does the United States have?\n" +
      "- Show me the comparison tab\n" +
      "- Show only household waste",
  };
}
