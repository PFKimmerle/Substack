import random

students = [
    'Alex', 'Ben', 'Charlie', 'Daisy', 'Ella', 'Finn', 'Grace', 'Hannah', 'Ivy', 'Jack',
    'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Parker', 'Quinn', 'Riley', 'Sophia', 'Thomas',
    'Uma', 'Victor', 'Willow', 'Xander', 'Yara', 'Zane', 'Aiden', 'Brooke', 'Connor', 'Delilah',
    'Ethan', 'Freya', 'Gavin', 'Harper', 'Isaac', 'Jade', 'Kara', 'Logan', 'Mila', 'Nathan',
    'Owen', 'Paisley', 'Reed', 'Sienna', 'Tyler', 'Violet', 'Wyatt', 'Ximena', 'Yosef', 'Zoe'
]

classes = [
    'Math', 'Science', 'History', 'English', 'PE', 'Art', 'Music', 'Computer Science',
    'Spanish', 'Geography', 'Drama', 'French', 'Biology', 'Chemistry', 'Physics'
]

def assign_classes_with_periods(students, classes):
    schedule = {}
    for student in students:
        student_classes = random.sample(classes, 7)
        period_schedule = {f'Period {i+1}': student_classes[i] for i in range(7)}
        schedule[student] = period_schedule
    return schedule

def print_student_schedule(name, schedule):
    if name in schedule:
        print(f"\n{name}'s Schedule:")
        for period, cls in schedule[name].items():
            print(f"{period}: {cls}")
    else:
        print(f"Student '{name}' not found. Please check the name and try again.")

def print_all_schedules(schedule):
    for student, periods in schedule.items():
        print(f"\n{student}'s Schedule:")
        for period, cls in periods.items():
            print(f"{period}: {cls}")

def main():
    student_schedule = assign_classes_with_periods(students, classes)
    
    while True:
        print("\nOptions:")
        print("1. Print all schedules")
        print("2. Print a specific student's schedule")
        print("3. Exit")
        
        choice = input("Enter your choice (1-3): ").strip()
        
        if choice == '1':
            print_all_schedules(student_schedule)
        elif choice == '2':
            name = input("Enter the student's name: ").strip()
            print_student_schedule(name, student_schedule)
        elif choice == '3':
            print("Thank you for using the Class Scheduling Script. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()