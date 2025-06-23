import React, { useState, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUpDown, 
  ExternalLink, 
  Trophy, 
  MessageSquare, 
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Star,
  Award,
  BarChart3
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export type TableData = {
  call_id: string;
  name: string;
  overallScore: number;
  communicationScore: number;
  callSummary: string;
};

interface DataTableProps {
  data: TableData[];
  interviewId: string;
}

function DataTable({ data, interviewId }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "overallScore", desc: true },
  ]);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((rowId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRowId(rowId);
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredRowId(null);
  }, []);

  const customSortingFn = (a: any, b: any) => {
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;
    return a - b;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 8) return "text-emerald-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number | null) => {
    if (!score) return "secondary";
    if (score >= 8) return "default";
    if (score >= 6) return "default";
    if (score >= 4) return "secondary";
    return "destructive";
  };

  const getScoreIcon = (score: number | null) => {
    if (!score) return <Minus className="w-3 h-3" />;
    if (score >= 8) return <TrendingUp className="w-3 h-3" />;
    if (score >= 6) return <TrendingUp className="w-3 h-3" />;
    if (score >= 4) return <Minus className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  const columns: ColumnDef<TableData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-sm hover:bg-indigo-50 transition-colors ${
              column.getIsSorted() ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <User className="mr-2 h-4 w-4" />
            Candidate Name
            <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-h-[3rem] py-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/interviews/${interviewId}?call=${row.original.call_id}`,
                      "_blank",
                    );
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-gray-800 text-white font-medium"
              >
                View detailed response
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 truncate max-w-[200px]">
              {row.getValue("name") || "Anonymous Candidate"}
            </span>
            <span className="text-xs text-gray-500 truncate">
              ID: {row.original.call_id.slice(-8)}
            </span>
          </div>
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string;
        const b = rowB.getValue(columnId) as string;
        return a.toLowerCase().localeCompare(b.toLowerCase());
      },
    },
    {
      accessorKey: "overallScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-sm hover:bg-indigo-50 transition-colors ${
              column.getIsSorted() ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Overall Score
            <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const score = row.getValue("overallScore") as number | null;
        return (
          <div className="flex items-center justify-center min-h-[3rem]">
            {score ? (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getScoreBadgeVariant(score)}
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {getScoreIcon(score)}
                  <span className="font-semibold">{score.toFixed(1)}</span>
                </Badge>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(score / 2) 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                <Minus className="w-3 h-3 mr-1" />
                No Score
              </Badge>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as number | null;
        const b = rowB.getValue(columnId) as number | null;
        return customSortingFn(a, b);
      },
    },
    {
      accessorKey: "communicationScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-sm hover:bg-indigo-50 transition-colors ${
              column.getIsSorted() ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:text-indigo-600"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Communication
            <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const score = row.getValue("communicationScore") as number | null;
        return (
          <div className="flex items-center justify-center min-h-[3rem]">
            {score ? (
              <div className="flex flex-col items-center gap-1">
                <Badge 
                  variant={getScoreBadgeVariant(score)}
                  className="flex items-center gap-1"
                >
                  {getScoreIcon(score)}
                  <span className="font-semibold">{score.toFixed(1)}</span>
                </Badge>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      score >= 8 ? "bg-emerald-500" :
                      score >= 6 ? "bg-blue-500" :
                      score >= 4 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                <Minus className="w-3 h-3 mr-1" />
                N/A
              </Badge>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as number | null;
        const b = rowB.getValue(columnId) as number | null;
        return customSortingFn(a, b);
      },
    },
    {
      accessorKey: "callSummary",
      header: () => (
        <div className="flex items-center justify-start font-semibold text-sm text-gray-700 px-4">
          <BarChart3 className="mr-2 h-4 w-4" />
          Interview Summary
        </div>
      ),
      cell: ({ row }) => {
        const summary = row.getValue("callSummary") as string;
        const isExpanded = hoveredRowId === row.id;

        return (
          <div className="py-2 px-2">
            <div className={`
              relative overflow-hidden transition-all duration-500 ease-in-out
              ${isExpanded ? "max-h-[500px]" : "max-h-[4rem]"}
            `}>
              <p className={`
                text-sm text-gray-700 leading-relaxed
                ${!isExpanded ? "line-clamp-3" : ""}
              `}>
                {summary || "No summary available"}
              </p>
              
              {!isExpanded && summary && summary.length > 150 && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            
            {summary && summary.length > 150 && (
              <div className="mt-2 flex justify-end">
                <Badge 
                  variant="outline" 
                  className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 cursor-pointer"
                >
                  {isExpanded ? "Hover to collapse" : "Hover to expand"}
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No candidate data available
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Once candidates complete their interviews, their performance data will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Candidates</p>
                <p className="text-2xl font-bold text-blue-900">{data.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Avg Overall Score</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {data.filter(d => d.overallScore).length > 0 
                    ? (data.reduce((sum, d) => sum + (d.overallScore || 0), 0) / data.filter(d => d.overallScore).length).toFixed(1)
                    : "N/A"
                  }
                </p>
              </div>
              <Award className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Communication</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.filter(d => d.communicationScore).length > 0 
                    ? (data.reduce((sum, d) => sum + (d.communicationScore || 0), 0) / data.filter(d => d.communicationScore).length).toFixed(1)
                    : "N/A"
                  }
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        className="text-left py-4 px-6 font-semibold text-gray-700"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`
                      transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      ${hoveredRowId === row.id ? "shadow-lg scale-[1.01] z-10 relative" : ""}
                      border-b border-gray-100 last:border-b-0
                    `}
                    onMouseEnter={() => handleMouseEnter(row.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 py-4 align-top"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataTable;
